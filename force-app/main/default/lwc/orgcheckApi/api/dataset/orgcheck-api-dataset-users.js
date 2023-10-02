import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { OrgCheckMap } from '../core/orgcheck-api-type-map';
import { SFDC_User } from '../data/orgcheck-api-data-user';

export class OrgCheckDatasetUsers extends OrgCheckDataset {

    run(sfdcManager, resolve, reject) {

        const IMPORTANT_PERMISSIONS = [ 'ApiEnabled', 'ViewSetup', 'ModifyAllData', 'ViewAllData' ];

        // SOQL query on User
        sfdcManager.soqlQuery([{ 
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
        }]).then((results) => {

            // Init the map
            const users = new OrgCheckMap();

            // Set the map
            results[0].records
                .forEach((record) => {

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

                    // Create the SFDC_User instance
                    const user = new SFDC_User({
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
                        permissionSetIds: permissionSetRefs,
                        isScoreNeeded: true
                    });

                    // Compute the score of this user, with the following rule:
                    //   - If the user is not using Lightning Experience, then you get +1.
                    //   - If the user never logged, then you get +1.
                    if (user.onLightningExperience === false) user.setBadField('onLightningExperience');
                    if (!user.lastLogin) user.setBadField('lastLogin');

                    // Add it to the map  
                    users.set(user.id, user);
                });

            // Return data
            resolve(users);
        }).catch(reject);
    } 
}