import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { SFDC_UserRole } from '../data/orgcheck-api-data-userrole';

export class OrgCheckDatasetUserRoles extends OrgCheckDataset {

    run(sfdcManager, dataFactory, localLogger, resolve, reject) {

        // SOQL queries on ExternalString
        sfdcManager.soqlQuery([{ 
            string: 'SELECT Id, DeveloperName, Name, ParentRoleId, PortalType, '+
                        '(SELECT Id, IsActive FROM Users)'+
                    ' FROM UserRole '
        }]).then((results) => {

            // Init the map
            const userRoles = new Map();

            // Init the factory
            const userRoleDataFactory = dataFactory.getInstance(SFDC_UserRole);

            // Set the map
            localLogger.log(`Parsing ${results[0].records.length} User Roles...`);
            results[0].records
                .forEach((record) => {

                    // Get the ID15 of this custom label
                    const id = sfdcManager.caseSafeId(record.Id);

                    // Create the instance
                    const userRole = userRoleDataFactory.create({
                        id: id,
                        url: sfdcManager.setupUrl('user-role', record.Id),
                        name: record.Name,
                        apiname: record.DeveloperName,
                        parentId: record.ParentRoleId ? sfdcManager.caseSafeId(record.ParentRoleId) : undefined,
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

                    // Compute the score of this item
                    userRoleDataFactory.computeScore(userRole);
                    /*
                    if (userRole.activeMembersCount === 0) userRole.setBadField('activeMembersCount');
                    */
                   
                    // Add it to the map  
                    userRoles.set(userRole.id, userRole);
                });

            // Return data
            resolve(userRoles);
        }).catch(reject);
    } 
}