import { DataAliases } from 'src/api/core/data/orgcheck-api-data-aliases';
import { DataFactoryIntf } from 'src/api/core/data/orgcheck-api-datafactory';
import { Dataset } from 'src/api/core/dataset/orgcheck-api-dataset';
import { SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { MediumProcessor } from 'src/api/core/orgcheck-api-processor';
import { SalesforceMetadataTypes } from 'src/api/core/salesforce/orgcheck-api-salesforce-metadatatypes';
import { SalesforceManagerIntf } from 'src/api/core/salesforce/orgcheck-api-salesforcemanager';
import { SfdcUserRole } from 'src/api/data/orgcheck-api-data-userrole';

export class DatasetUserRoles implements Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @returns {Promise<Map<string, SfdcUserRole>>} The result of the dataset
     */
    async run(sfdcManager: SalesforceManagerIntf, dataFactory: DataFactoryIntf, logger: SimpleLoggerIntf): Promise<Map<string, SfdcUserRole>> {

        // First SOQL query
        logger?.log(`Querying REST API about UserRole in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            string: 'SELECT Id, DeveloperName, Name, ParentRoleId, ' +
                        '(SELECT Id FROM Users WHERE IsActive = true AND ContactId = NULL AND Profile.Id != NULL) ' + // only active internal users
                    'FROM UserRole '+
                    `WHERE PortalType = 'None' ` // only internal roles
        }], logger);

        // Init the factory and records
        const userRoleDataFactory = dataFactory.getInstance(DataAliases.SfdcUserRole);

        // Create the map
        const userRoleRecords = results[0];
        logger?.log(`Parsing ${userRoleRecords?.length} user roles...`);
        const childrenByParent = new Map<string, SfdcUserRole[]>();
        const roots: SfdcUserRole[] = [];
        const roles: Map<string, SfdcUserRole> = new Map(await MediumProcessor.map(userRoleRecords, async (record: Record<string, unknown>) => {

            // Get the ID15 of this custom label
            const id = sfdcManager.caseSafeId(record.Id as string);

            // Create the instance
            const userRole: SfdcUserRole = userRoleDataFactory.create({
                properties: {
                    id: id,
                    name: record.Name,
                    apiname: record.DeveloperName,
                    parentId: record.ParentRoleId ? sfdcManager.caseSafeId(record.ParentRoleId as string) : undefined,
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
                childrenByParent.get(userRole.parentId!)!.push(userRole);
            }
            // compute the numbers of users
            await MediumProcessor.forEach(
                ((record.Users as { records?: Record<string, unknown>[] } | undefined)?.records ?? []), 
                async (user: Record<string, unknown>) => {
                    userRole.activeMemberIds.push(sfdcManager.caseSafeId(user.Id as string));
                }
            );
            userRole.activeMembersCount = userRole.activeMemberIds?.length;
            userRole.hasActiveMembers = userRole.activeMemberIds?.length > 0;

            // Add it to the map  
            return [ userRole.id, userRole ];
        }));

        // Compute levels 
        await MediumProcessor.forEach(roots, async (root: SfdcUserRole) => {
            root.level = 1;
            RECURSIVE_LEVEL_CALCULUS(root, childrenByParent);
        });

        // Then compute the score of roles 
        await MediumProcessor.forEach(roles, async (userRole: SfdcUserRole) => {
            userRoleDataFactory.computeScore(userRole);
        });

        // Return data as map
        logger?.log(`Done.`);
        return roles;
    } 
}

const RECURSIVE_LEVEL_CALCULUS = (parent: SfdcUserRole, childrenByParent: Map<string, SfdcUserRole[]>) => {
    const children = childrenByParent.get(parent.id);
    children?.forEach((child) => {
        child.level = parent.level + 1;
        RECURSIVE_LEVEL_CALCULUS(child, childrenByParent);
    });
}