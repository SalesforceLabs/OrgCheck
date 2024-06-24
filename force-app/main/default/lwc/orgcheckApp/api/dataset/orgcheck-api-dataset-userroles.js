import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';
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

        // Init the factory and records
        const userRoleDataFactory = dataFactory.getInstance(SFDC_UserRole);

        // Create the map
        const userRoleRecords = results[0].records;
        localLogger.log(`Parsing ${userRoleRecords.length} user roles...`);
        const roles = new Map(await OrgCheckProcessor.carte(userRoleRecords, async (record) => {

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
            await OrgCheckProcessor.chaque(
                record?.Users?.records, 
                (user) => {
                    if (user.IsActive === true) {
                        userRole.activeMemberIds.push(sfdcManager.caseSafeId(user.Id));
                    } else {
                        userRole.inactiveMembersCount++;
                    }
                }
            );
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