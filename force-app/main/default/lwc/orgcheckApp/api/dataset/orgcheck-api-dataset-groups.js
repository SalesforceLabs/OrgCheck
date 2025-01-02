import { OrgCheckDataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { OrgCheckSimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';
import { OrgCheckSalesforceMetadataTypes } from '../core/orgcheck-api-salesforce-metadatatypes';
import { OrgCheckSalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';
import { SFDC_Group } from '../data/orgcheck-api-data-group';

export class OrgCheckDatasetGroups extends OrgCheckDataset {

    /**
     * @description Run the dataset and return the result
     * @param {OrgCheckSalesforceManagerIntf} sfdcManager
     * @param {OrgCheckDataFactoryIntf} dataFactory
     * @param {OrgCheckSimpleLoggerIntf} logger List of optional argument to pass
     * @returns {Promise<Map<string, SFDC_Group>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First SOQL query
        logger?.log(`Querying REST API about Group in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            string: 'SELECT Id, Name, DeveloperName, DoesIncludeBosses, Type, RelatedId, Related.Name, ' +
                        '(SELECT UserOrGroupId From GroupMembers)' +
                    'FROM Group '
        }], logger);

        // Init the factory and records
        const groupDataFactory = dataFactory.getInstance(SFDC_Group);

        // Create the map
        const groupRecords = results[0].records;
        logger?.log(`Parsing ${groupRecords.length} groups...`);
        const groups = new Map(await OrgCheckProcessor.map(groupRecords, async (record) => {
        
            // Get the ID15 of this custom field
            const groupId = sfdcManager.caseSafeId(record.Id);

            // Depending on the type we have some specific properties
            let groupType, groupName, groupDeveloperName, groupIncludesBosses, groupIncludesSubordinates, groupRelatedId;
            switch (record.Type) {
                case 'Regular': 
                case 'Queue': {
                    groupType = record.Type === 'Regular' ? OrgCheckSalesforceMetadataTypes.PUBLIC_GROUP : OrgCheckSalesforceMetadataTypes.QUEUE;
                    groupName = record.Name;
                    groupDeveloperName = record.DeveloperName;
                    groupIncludesBosses = record.DoesIncludeBosses;
                    break;
                }
                case 'Role':
                case 'RoleAndSubordinates':
                case 'RoleAndSubordinatesInternal': {
                    groupType = OrgCheckSalesforceMetadataTypes.ROLE;
                    groupName = record.Related.Name;
                    groupIncludesSubordinates = record.Type !== 'Role';
                    groupRelatedId = sfdcManager.caseSafeId(record.RelatedId);
                    break;
                }
                case 'AllCustomerPortal':
                case 'Organization':
                case 'PRMOrganization':
                case 'GuestUserGroup':
                default: {
                    groupName = record.Type;
                    groupType = OrgCheckSalesforceMetadataTypes.TECHNICAL_GROUP;
                    break;
                }
            }

            // Handle the direct group membership
            const groupDirectUserIds = [], groupDirectGroupIds = [];
            if (record.GroupMembers && record.GroupMembers.records && record.GroupMembers.records.length > 0) {
                await OrgCheckProcessor.forEach(
                    record.GroupMembers.records, 
                    (m) => {
                        const groupMemberId = sfdcManager.caseSafeId(m.UserOrGroupId);
                        (groupMemberId.startsWith('005') ? groupDirectUserIds : groupDirectGroupIds).push(groupMemberId);
                    }
                );
            }

            // Create the instance (common one)
            const group = groupDataFactory.createWithScore({
                properties: {
                    id: groupId,
                    name: groupName, 
                    developerName: groupDeveloperName, 
                    type: groupType,
                    isPublicGroup: record.Type === 'Regular',
                    isQueue: record.Type === 'Queue',
                    nbDirectMembers: groupDirectUserIds.length + groupDirectGroupIds.length,
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
        logger?.log(`Done`);
        return groups;
    } 
}