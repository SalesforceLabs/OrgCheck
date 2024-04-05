import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { SFDC_PermissionSet } from '../data/orgcheck-api-data-permissionset';

export class OrgCheckDatasetPermissionSets extends OrgCheckDataset {

    run(sfdcManager, dataFactory, localLogger, resolve, reject) {

        // SOQL query on PermissionSet
        sfdcManager.soqlQuery([{ 
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
            byPasses: [ 'INVALID_TYPE' ],
            string: 'SELECT Id, PermissionSetGroupId, PermissionSetGroup.Description '+
                    'FROM PermissionSet '+
                    'WHERE PermissionSetGroupId != null ' 
        }]).then((results) => {

            // Init the map
            const permissionSets = new Map();

            // Init the factory
            const permissionSetDataFactory = dataFactory.getInstance(SFDC_PermissionSet);

            // Set the map
            localLogger.log(`Parsing ${results[0].records.length} Permission Sets...`);
            results[0].records
                .forEach((record) => {

                    // Get the ID15 of this permission set
                    const id = sfdcManager.caseSafeId(record.Id);
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
                        nbObjectPermissions: record.ObjectPerms?.records.length || 0,
                        profileIds: {},
                        isScoreNeeded: true
                    });

                    // Compute the score of this item
                    permissionSetDataFactory.computeScore(permissionSet);
                    /*
                    if (permissionSet.isCustom === true && permissionSet.memberCounts === 0) permissionSet.setBadField('memberCounts');
                    if (permissionSet.isCustom === true && sfdcManager.isEmpty(permissionSet.description)) permissionSet.setBadField('description');
                    */
                    
                    // Add it to the map
                    permissionSets.set(id, permissionSet);
                });

            localLogger.log(`Parsing ${results[1].records.length} Permission Set Assignments...`);
            results[1].records
                .forEach((record) => {
                    const permissionSetId = sfdcManager.caseSafeId(record.PermissionSetId);
                    const profileId = sfdcManager.caseSafeId(record.Assignee.ProfileId);
                    if (permissionSets.has(permissionSetId)) {
                        const permissionSet = permissionSets.get(permissionSetId);
                        if (permissionSet.profileIds[profileId] !== true) permissionSet.profileIds[profileId] = true;
                    }
                });

            localLogger.log(`Parsing ${results[2].records.length} Permission Set Groups...`);
            results[2].records
                .forEach((record) => {
                    const permissionSetId = sfdcManager.caseSafeId(record.Id);
                    const permissionSetGroupId = sfdcManager.caseSafeId(record.PermissionSetGroupId);
                    if (permissionSets.has(permissionSetId)) {
                        const permissionSet = permissionSets.get(permissionSetId);
                        permissionSet.url = sfdcManager.setupUrl('permission-set-group', permissionSetGroupId);
                        permissionSet.isGroup = true;
                    }
                });
            permissionSets.forEach((permissionSet) => {
                permissionSet.profileIds = Object.keys(permissionSet.profileIds);
            });

            // Return data
            resolve(permissionSets);
        }).catch(reject);
    } 
}