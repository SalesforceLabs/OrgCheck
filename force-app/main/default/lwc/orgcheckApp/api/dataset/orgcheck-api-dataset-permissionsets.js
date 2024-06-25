import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';
import { SFDC_PermissionSet } from '../data/orgcheck-api-data-permissionset';

export class OrgCheckDatasetPermissionSets extends OrgCheckDataset {

    async run(sfdcManager, dataFactory, localLogger) {

        // First SOQL queries
        localLogger.log(`Querying REST API about PermissionSet, PermissionSetAssignment and PermissionSet (with a PermissionSetGroupId populated) in the org...`);            
        const results = await sfdcManager.soqlQuery([{ 
            string: 'SELECT Id, Name, Description, IsCustom, License.Name, NamespacePrefix, Type, '+
                        'PermissionsApiEnabled, PermissionsViewSetup, PermissionsModifyAllData, PermissionsViewAllData, '+
                        'CreatedDate, LastModifiedDate, '+
                        '(SELECT Id FROM FieldPerms LIMIT 51), '+
                        '(SELECT Id FROM ObjectPerms LIMIT 51)'+
                    'FROM PermissionSet '+
                    'WHERE IsOwnedByProfile = FALSE' 
        }, { 
            string: 'SELECT Id, AssigneeId, Assignee.ProfileId, PermissionSetId '+
                    'FROM PermissionSetAssignment '+
                    'WHERE Assignee.IsActive = TRUE '+
                    'AND PermissionSet.IsOwnedByProfile = FALSE '+
                    'ORDER BY PermissionSetId '
        }, {
            byPasses: [ 'INVALID_TYPE' ], // in some org PermissionSetGroup is not defined!
            string: 'SELECT Id, PermissionSetGroupId, PermissionSetGroup.Description '+
                    'FROM PermissionSet '+
                    'WHERE PermissionSetGroupId != null ' 
        }], localLogger);

        // Init the factory and records
        const permissionSetDataFactory = dataFactory.getInstance(SFDC_PermissionSet);

        // Create the map
        const permissionSetRecords = results[0].records;
        localLogger.log(`Parsing ${permissionSetRecords.length} permission sets...`);
        const permissionSets = new Map(await OrgCheckProcessor.carte(permissionSetRecords, (record) => {

            // Get the ID15
            const id = sfdcManager.caseSafeId(record.Id);
        
            // Create the instance
            const permissionSet = permissionSetDataFactory.create({
                id: id,
                url: sfdcManager.setupUrl('permission-set', id),
                name: record.Name,
                apiName: (record.NamespacePrefix ? (record.NamespacePrefix + '__') : '') + record.Name,
                description: record.Description,
                license: (record.License ? record.License.Name : ''),
                isCustom: record.IsCustom,
                package: (record.NamespacePrefix || ''),
                memberCounts: 0, // default value, may be changed in second SOQL
                isGroup: (record.Type === 'Group'),  // other values can be 'Regular', 'Standard', 'Session'
                type: (record.Type === 'Group' ? 'Permission Set Group' : 'Permission Set'),
                createdDate: record.CreatedDate, 
                lastModifiedDate: record.LastModifiedDate,
                nbFieldPermissions: record.FieldPerms?.records.length || 0,
                nbObjectPermissions: record.ObjectPerms?.records.length || 0,
                importantPermissions: {
                    apiEnabled: record.PermissionsApiEnabled,
                    viewSetup: record.PermissionsViewSetup, 
                    modifyAllData: record.PermissionsModifyAllData, 
                    viewAllData: record.PermissionsViewAllData
                }
            });

            // Add it to the map  
            return [ permissionSet.id, permissionSet ];
        }));

        const permissionSetAssignmentRecords = results[1].records;
        localLogger.log(`Parsing ${permissionSetAssignmentRecords.length} Permission Set Assignments...`);
        const assigneeProfileIdsByPermSetId = new Map();
        await OrgCheckProcessor.chaque(permissionSetAssignmentRecords, (record) => {
            const permissionSetId = sfdcManager.caseSafeId(record.PermissionSetId);
            const assigneeProfileId = sfdcManager.caseSafeId(record.Assignee.ProfileId);
            if (permissionSets.has(permissionSetId)) {
                // This permission set is assigned to users with this profile
                if (assigneeProfileIdsByPermSetId.has(permissionSetId) === false) {
                    assigneeProfileIdsByPermSetId.set(permissionSetId, new Set());
                }
                assigneeProfileIdsByPermSetId.get(permissionSetId).add(assigneeProfileId);
                // Add to the count of member for this permission set
                permissionSets.get(permissionSetId).memberCounts++;
            }
        });
        await OrgCheckProcessor.chaque(assigneeProfileIdsByPermSetId, (assigneeProfileIds, permissionSetId) => {
            permissionSets.get(permissionSetId).assigneeProfileIds = Array.from(assigneeProfileIds);
        });

        const permissionSetGroupRecords = results[2].records;
        localLogger.log(`Parsing ${permissionSetGroupRecords.length} Permission Set Groups...`);
        await OrgCheckProcessor.chaque(permissionSetGroupRecords, (record) => {
            const permissionSetId = sfdcManager.caseSafeId(record.Id);
            const permissionSetGroupId = sfdcManager.caseSafeId(record.PermissionSetGroupId);
            if (permissionSets.has(permissionSetId)) {
                const permissionSet = permissionSets.get(permissionSetId);
                permissionSet.url = sfdcManager.setupUrl('permission-set-group', permissionSetGroupId);
                permissionSet.isGroup = true;
            }
        });

        // Compute scores for all permission sets
        localLogger.log(`Computing the score for ${permissionSets.size} permission sets...`);
        await OrgCheckProcessor.chaque(permissionSets, (permissionSet) => {
            permissionSetDataFactory.computeScore(permissionSet);
        });
        
        // Return data as map
        localLogger.log(`Done`);
        return permissionSets;
    } 
}