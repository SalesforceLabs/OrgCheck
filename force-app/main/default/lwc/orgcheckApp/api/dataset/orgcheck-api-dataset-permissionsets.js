import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { SFDC_PermissionSet } from '../data/orgcheck-api-data-permissionset';

export class OrgCheckDatasetPermissionSets extends OrgCheckDataset {

    async run(sfdcManager, dataFactory, localLogger) {

        // First SOQL queries
        localLogger.log(`Querying REST API about PermissionSet, PermissionSetAssignment and PermissionSet (with a PermissionSetGroupId populated) in the org...`);            
        const results = await sfdcManager.soqlQuery([{ 
            string: 'SELECT Id, Name, Description, IsCustom, License.Name, NamespacePrefix, Type, '+
                        'CreatedDate, LastModifiedDate, '+
                        '(SELECT Id FROM Assignments WHERE Assignee.IsActive = TRUE LIMIT 51), '+
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

        // Init the factory
        const permissionSetDataFactory = dataFactory.getInstance(SFDC_PermissionSet);

        // Create the map
        localLogger.log(`Parsing ${results[0].records.length} permission sets...`);
        const permissionSets = new Map(results[0].records.map((record) => {

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
                memberCounts: (record.Assignments && record.Assignments.records) ? record.Assignments.records.length : 0,
                isGroup: (record.Type === 'Group'),  // other values can be 'Regular', 'Standard', 'Session'
                type: (record.Type === 'Group' ? 'Permission Set Group' : 'Permission Set'),
                createdDate: record.CreatedDate, 
                lastModifiedDate: record.LastModifiedDate,
                nbFieldPermissions: record.FieldPerms?.records.length || 0,
                nbObjectPermissions: record.ObjectPerms?.records.length || 0
            });

            // Add it to the map  
            return [ permissionSet.id, permissionSet ];
        }));

        localLogger.log(`Parsing ${results[1].records.length} Permission Set Assignments...`);
        const assigneeProfileIdsByPermSetId = new Map();
        results[1].records.forEach((record) => {
            const permissionSetId = sfdcManager.caseSafeId(record.PermissionSetId);
            const assigneeProfileId = sfdcManager.caseSafeId(record.Assignee.ProfileId);
            if (permissionSets.has(permissionSetId)) {
                if (assigneeProfileIdsByPermSetId.has(permissionSetId) === false) {
                    assigneeProfileIdsByPermSetId.set(permissionSetId, new Set());
                }
                assigneeProfileIdsByPermSetId.get(permissionSetId).add(assigneeProfileId);
            }
        });
        assigneeProfileIdsByPermSetId.forEach((assigneeProfileIds, permissionSetId) => {
            permissionSets.get(permissionSetId).assigneeProfileIds = Array.from(assigneeProfileIds);
        });

        localLogger.log(`Parsing ${results[2].records.length} Permission Set Groups...`);
        results[2].records.forEach((record) => {
            const permissionSetId = sfdcManager.caseSafeId(record.Id);
            const permissionSetGroupId = sfdcManager.caseSafeId(record.PermissionSetGroupId);
            if (permissionSets.has(permissionSetId)) {
                const permissionSet = permissionSets.get(permissionSetId);
                permissionSet.url = sfdcManager.setupUrl('permission-set-group', permissionSetGroupId);
                permissionSet.isGroup = true;
            }
        });

        // Return data as map
        localLogger.log(`Done`);
        return permissionSets;
    } 
}