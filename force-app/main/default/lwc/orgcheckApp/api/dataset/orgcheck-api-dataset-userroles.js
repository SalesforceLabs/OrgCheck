import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { SFDC_UserRole } from '../data/orgcheck-api-data-userrole';

export class OrgCheckDatasetUserRoles extends OrgCheckDataset {

    run(sfdcManager, resolve, reject) {

        // SOQL queries on ExternalString
        sfdcManager.soqlQuery([{ 
            string: 'SELECT Id, DeveloperName, Name, ParentRoleId, PortalType, '+
                        '(SELECT Id, IsActive FROM Users)'+
                    ' FROM UserRole '
        }]).then((results) => {

            // Init the map
            const userRoles = new Map();

            // Make sure we have a unique root
            const ROOT_ID = '###root###';
            const ROOT_ROLE = new SFDC_UserRole({
                id: ROOT_ID,
                name: 'Role Hierarchy',
                developerName: ROOT_ID,
                parentId: null
            });
            userRoles.set(ROOT_ID, ROOT_ROLE);

            // Set the map
            results[0].records
                .forEach((record) => {

                    // Get the ID15 of this custom label
                    const id = sfdcManager.caseSafeId(record.Id);

                    // Create the instance
                    const userRole = new SFDC_UserRole({
                        id: id,
                        url: sfdcManager.setupUrl('user-role', record.Id),
                        name: record.Name,
                        apiname: record.DeveloperName,
                        parentId: record.ParentRoleId ? sfdcManager.caseSafeId(record.ParentRoleId) : ROOT_ID,
                        hasParent: record.ParentRoleId ? true : false,
                        activeMembersCount: 0,
                        activeMemberIds: [],
                        hasActiveMembers: false,
                        inactiveMembersCount: 0,
                        hasInactiveMembers: false,
                        isExternal: (record.PortalType !== 'None') ? true : false,
                        isScoreNeeded: true
                    });                
                    if (record.Users && record.Users.records) {
                        record.Users.records.forEach((user) => {
                            if (user.IsActive === true) {
                                userRole.activeMemberIds.push(sfdcManager.caseSafeId(user.Id));
                            } else {
                                userRole.inactiveMembersCount++;
                            }
                        });
                    }
                    userRole.activeMembersCount = userRole.activeMemberIds.length;
                    userRole.hasActiveMembers = userRole.activeMemberIds.length > 0;
                    userRole.hasInactiveMembers = userRole.inactiveMembersCount > 0;

                    // Compute the score of this user role, with the following rule:
                    //  - If the role has no active user in it, then you get +1.
                    if (userRole.activeMembersCount === 0) userRole.setBadField('activeMemberRefs');
                    // Add it to the map  
                    userRoles.set(userRole.id, userRole);
                });

            // Return data
            resolve(userRoles);
        }).catch(reject);
    } 
}