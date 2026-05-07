import { DataAliases } from 'src/api/core/data/orgcheck-api-data-aliases';
import { DataFactoryIntf } from 'src/api/core/data/orgcheck-api-datafactory';
import { Dataset } from 'src/api/core/dataset/orgcheck-api-dataset';
import { SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { MediumProcessor } from 'src/api/core/orgcheck-api-processor';
import { SalesforceMetadataTypes } from 'src/api/core/salesforce/orgcheck-api-salesforce-metadatatypes';
import { SalesforceManagerIntf } from 'src/api/core/salesforce/orgcheck-api-salesforcemanager';
import { SfdcGroup } from 'src/api/data/orgcheck-api-data-group';

export class DatasetGroups implements Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - List of optional argument to pass
     * @returns {Promise<Map<string, SfdcGroup>>} The result of the dataset
     */
    async run(sfdcManager: SalesforceManagerIntf, dataFactory: DataFactoryIntf, logger: SimpleLoggerIntf): Promise<Map<string, SfdcGroup>> {

        // First SOQL query
        logger?.log(`Querying REST API about Group in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            string: 'SELECT Id, Name, DeveloperName, DoesIncludeBosses, Type, RelatedId, Related.Name, ' +
                        '(SELECT UserOrGroupId From GroupMembers)' + // optimisation?
                    'FROM Group '
        }], logger);

        // Init the factory and records
        const groupDataFactory = dataFactory.getInstance(DataAliases.SfdcGroup);

        // Create the map
        const groupRecords = results[0];
        logger?.log(`Parsing ${groupRecords?.length} groups...`);
        const groups: Map<string, SfdcGroup> = new Map(await MediumProcessor.map(groupRecords, async (record: Record<string, unknown>) => {
        
            // Get the ID15 of this custom field
            const groupId = sfdcManager.caseSafeId(record.Id as string);

            // Depending on the type we have some specific properties
            let groupType, groupName, groupDeveloperName, groupIncludesBosses, groupIncludesSubordinates, groupRelatedId;
            switch (record.Type) {
                case 'Regular': 
                case 'Queue': {
                    groupType = record.Type === 'Regular' ? SalesforceMetadataTypes.PUBLIC_GROUP : SalesforceMetadataTypes.QUEUE;
                    groupName = record.Name;
                    groupDeveloperName = record.DeveloperName;
                    groupIncludesBosses = record.DoesIncludeBosses;
                    break;
                }
                case 'Role':
                case 'RoleAndSubordinates':
                case 'RoleAndSubordinatesInternal': {
                    groupType = SalesforceMetadataTypes.ROLE;
                    groupName = (record.Related as { Name?: string } | undefined)?.Name ?? '(unknown)';
                    groupIncludesSubordinates = record.Type !== 'Role';
                    groupRelatedId = sfdcManager.caseSafeId(record.RelatedId as string);
                    break;
                }
                case 'AllCustomerPortal':
                case 'Organization':
                case 'PRMOrganization':
                case 'GuestUserGroup':
                default: {
                    groupName = record.Type;
                    groupType = SalesforceMetadataTypes.TECHNICAL_GROUP;
                    break;
                }
            }

            // Handle the direct group membership
            const groupDirectUserIds: string[] = [], groupDirectGroupIds: string[] = [];
            const groupMembers = record.GroupMembers as { records?: Record<string, unknown>[] } | undefined;
            if (groupMembers?.records && groupMembers.records.length > 0) {
                await MediumProcessor.forEach(
                    groupMembers.records, 
                    async (m: Record<string, unknown>) => {
                        const groupMemberId = sfdcManager.caseSafeId(m.UserOrGroupId as string);
                        (groupMemberId.startsWith('005') ? groupDirectUserIds : groupDirectGroupIds).push(groupMemberId);
                    }
                );
            }

            // Create the instance (common one)
            const group: SfdcGroup = groupDataFactory.createWithScore({
                properties: {
                    id: groupId,
                    name: groupName, 
                    developerName: groupDeveloperName, 
                    type: groupType,
                    isPublicGroup: record.Type === 'Regular',
                    isQueue: record.Type === 'Queue',
                    nbDirectMembers: groupDirectUserIds?.length + groupDirectGroupIds?.length,
                    directUserIds: groupDirectUserIds,
                    directGroupIds: groupDirectGroupIds,
                    includeBosses: groupIncludesBosses === true, 
                    includeSubordinates: groupIncludesSubordinates === true,
                    relatedId: groupRelatedId,
                    url: sfdcManager.setupUrl(groupRelatedId ?? groupId, groupType)
                }
            });

            // Add it to the map  
            return [ group.id, group ];
        }));

        // Return data as map
        logger?.log(`Done.`);
        return groups;
    } 
}