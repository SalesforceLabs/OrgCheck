import { OrgCheckDataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { OrgCheckSimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';
import { OrgCheckSalesforceMetadataTypes } from '../core/orgcheck-api-salesforce-metadatatypes';
import { OrgCheckSalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';
import { SFDC_UserRole } from '../data/orgcheck-api-data-userrole';

export class OrgCheckDatasetUserRoles extends OrgCheckDataset {

    /**
     * @description Run the dataset and return the result
     * @param {OrgCheckSalesforceManagerIntf} sfdcManager
     * @param {OrgCheckDataFactoryIntf} dataFactory
     * @param {OrgCheckSimpleLoggerIntf} logger
     * @returns {Promise<Map<string, SFDC_UserRole>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First SOQL query
        logger?.log(`Querying REST API about UserRole in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            string: 'SELECT Id, DeveloperName, Name, ParentRoleId, PortalType, ' +
                        '(SELECT Id, IsActive FROM Users)' +
                    ' FROM UserRole '
        }], logger);

        // Init the factory and records
        const userRoleDataFactory = dataFactory.getInstance(SFDC_UserRole);

        // Create the map
        const userRoleRecords = results[0].records;
        logger?.log(`Parsing ${userRoleRecords.length} user roles...`);
        const roles = new Map(await OrgCheckProcessor.map(userRoleRecords, async (record) => {

            // Get the ID15 of this custom label
            const id = sfdcManager.caseSafeId(record.Id);

            // Create the instance
            const userRole = userRoleDataFactory.create({
                properties: {
                    id: id,
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
                    url: sfdcManager.setupUrl(id, OrgCheckSalesforceMetadataTypes.ROLE)
                }
            });         
            await OrgCheckProcessor.forEach(
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
        logger?.log(`Done`);
        return roles;
    } 
}