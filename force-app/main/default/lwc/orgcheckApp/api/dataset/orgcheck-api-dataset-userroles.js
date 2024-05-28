import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { SFDC_UserRole } from '../data/orgcheck-api-data-userrole';

export class OrgCheckDatasetUserRoles extends OrgCheckDataset {

    async run(sfdcManager, dataFactory, localLogger) {

        // First SOQL query
        localLogger.log(`Querying REST API about UserRole in the org...`);            
        const results = await sfdcManager.soqlQuery([{ 
            string: 'SELECT Id, DeveloperName, Name, ParentRoleId, PortalType, '+
                        '(SELECT Id, IsActive FROM Users)'+
                    ' FROM UserRole '
        }], localLogger);

        // Init the factory
        const userRoleDataFactory = dataFactory.getInstance(SFDC_UserRole);

        // Create the map
        localLogger.log(`Parsing ${results[0].records.length} user roles...`);
        const roles = new Map(results[0].records.map((record) => {

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
                isExternal: (record.PortalType !== 'None') ? true : false
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

            // Add it to the map  
            return [ userRole.id, userRole ];
        }));

        // Return data as map
        localLogger.log(`Done`);
        return roles;
    } 
}