import { DataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { Dataset } from '../core/orgcheck-api-dataset';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { Processor } from '../core/orgcheck-api-processor';
import { SalesforceMetadataTypes } from '../core/orgcheck-api-salesforce-metadatatypes';
import { SalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';
import { SFDC_UserRole } from '../data/orgcheck-api-data-userrole';

export class DatasetUserRoles extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager
     * @param {DataFactoryIntf} dataFactory
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<Map<string, SFDC_UserRole>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First SOQL query
        logger?.log(`Querying REST API about UserRole in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            string: 'SELECT Id, DeveloperName, Name, ParentRoleId, ' +
                        '(SELECT Id FROM Users WHERE IsActive = true AND ContactId = NULL AND Profile.Id != NULL) ' + // only active internal users
                    'FROM UserRole '+
                    `WHERE PortalType = 'None' ` // only internal roles
        }], logger);

        // Init the factory and records
        const userRoleDataFactory = dataFactory.getInstance(SFDC_UserRole);

        // Create the map
        const userRoleRecords = results[0];
        logger?.log(`Parsing ${userRoleRecords.length} user roles...`);
        const childrenByParent = new Map();
        const roots = [];
        const roles = new Map(await Processor.map(userRoleRecords, async (record) => {

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
                    url: sfdcManager.setupUrl(id, SalesforceMetadataTypes.ROLE)
                }
            });
            // manage kids/parent relationship
            if (userRole.hasParent === false) {
                roots.push(userRole);
            } else {
                if (childrenByParent.has(userRole.parentId) === false) {
                    childrenByParent.set(userRole.parentId, []);
                }
                childrenByParent.get(userRole.parentId).push(userRole);
            }
            // compute the numbers of users
            await Processor.forEach(
                record?.Users?.records, 
                (user) => {
                    userRole.activeMemberIds.push(sfdcManager.caseSafeId(user.Id));
                }
            );
            userRole.activeMembersCount = userRole.activeMemberIds.length;
            userRole.hasActiveMembers = userRole.activeMemberIds.length > 0;

            // Add it to the map  
            return [ userRole.id, userRole ];
        }));

        // Compute levels 
        await Processor.forEach(roots, async (root) => {
            root.level = 1;
            RECURSIVE_LEVEL_CALCULUS(root, childrenByParent);
        });

        // Then compute the score of roles 
        await Processor.forEach(roles, async (userRole) => {
            userRoleDataFactory.computeScore(userRole);
        });

        // Return data as map
        logger?.log(`Done`);
        return roles;
    } 
}

const RECURSIVE_LEVEL_CALCULUS = (parent, childrenByParent) => {
    const children = childrenByParent.get(parent.id);
    children?.forEach((child) => {
        child.level = parent.level + 1;
        RECURSIVE_LEVEL_CALCULUS(child, childrenByParent);
    });
}