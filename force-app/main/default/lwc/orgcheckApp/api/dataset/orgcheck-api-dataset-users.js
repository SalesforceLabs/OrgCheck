import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { SFDC_User } from '../data/orgcheck-api-data-user';

export class OrgCheckDatasetUsers extends OrgCheckDataset {

    async run(sfdcManager, dataFactory, localLogger) {

        const IMPORTANT_PERMISSIONS = [ 'ApiEnabled', 'ViewSetup', 'ModifyAllData', 'ViewAllData' ];

        // First SOQL query
        localLogger.log(`Querying REST API about User in the org...`);            
        const results = await sfdcManager.soqlQuery([{ 
            string: 'SELECT Id, Name, SmallPhotoUrl, ProfileId, '+
            'LastLoginDate, LastPasswordChangeDate, NumberOfFailedLogins, '+
            'UserPreferencesLightningExperiencePreferred, '+
            '(SELECT PermissionSetId, '+
                'PermissionSet.PermissionsApiEnabled, '+
                'PermissionSet.PermissionsViewSetup, '+
                'PermissionSet.PermissionsModifyAllData, '+
                'PermissionSet.PermissionsViewAllData, '+
                'PermissionSet.IsOwnedByProfile '+
                'FROM PermissionSetAssignments) '+
            'FROM User '+
            'WHERE Profile.Id != NULL ' + // we do not want the Automated Process users!
            'AND IsActive = true ', // we only want active users
        }], localLogger);

        // Init the factory
        const userDataFactory = dataFactory.getInstance(SFDC_User);

        // Create the map
        localLogger.log(`Parsing ${results[0].records.length} users...`);
        const users = new Map(results[0].records.map((record) => {
        
            // Get the ID15 of this user
            const id = sfdcManager.caseSafeId(record.Id);

            // Check if this user has a set of important permissions in Profile and Permission Sets
            // At the same time, set the reference if of its permission sets
            const importantPermissions = {};
            const permissionSetRefs = [];
            if (record.PermissionSetAssignments && record.PermissionSetAssignments.records) {
                record.PermissionSetAssignments.records.forEach((assignment) => {
                    IMPORTANT_PERMISSIONS.forEach((permission) => {
                        if (assignment.PermissionSet[`Permissions${permission}`] === true) {
                            importantPermissions[permission] = true;
                        }
                    });
                    if (assignment.PermissionSet.IsOwnedByProfile === false) {
                        permissionSetRefs.push(sfdcManager.caseSafeId(assignment.PermissionSetId));
                    }
                });
            }

            // Create the instance
            const user = userDataFactory.createWithScore({
                id: id,
                url: sfdcManager.setupUrl('user', id),
                photoUrl: record.SmallPhotoUrl,
                name: record.Name,
                lastLogin: record.LastLoginDate,
                numberFailedLogins: record.NumberOfFailedLogins,
                onLightningExperience: record.UserPreferencesLightningExperiencePreferred,
                lastPasswordChange: record.LastPasswordChangeDate,
                profileId: sfdcManager.caseSafeId(record.ProfileId),
                importantPermissions: Object.keys(importantPermissions).sort(),
                permissionSetIds: permissionSetRefs
            });

            // Add it to the map  
            return [ user.id, user ];
        }));

        // Return data as map
        localLogger.log(`Done`);
        return users;
    } 
}