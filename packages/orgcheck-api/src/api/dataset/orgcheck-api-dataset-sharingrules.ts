import { DataAliases } from 'src/api/core/data/orgcheck-api-data-aliases';
import { DataFactoryIntf } from 'src/api/core/data/orgcheck-api-datafactory';
import { Dataset } from 'src/api/core/dataset/orgcheck-api-dataset';
import { SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { MediumProcessor } from 'src/api/core/orgcheck-api-processor';
import { SalesforceMetadataTypes } from 'src/api/core/salesforce/orgcheck-api-salesforce-metadatatypes';
import { SalesforceManagerIntf } from 'src/api/core/salesforce/orgcheck-api-salesforcemanager';
import { SfdcSharingRule } from 'src/api/data/orgcheck-api-data-sharingrule';

const metadata_MakeItArray = (value: any) => (Array.isArray(value) ? value : [ value ]);

export class DatasetSharingRules implements Dataset {

    /**
     * @description Run the dataset and return the result.
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @returns {Promise<Map<string, SfdcSharingRule>>} The result of the dataset
     */
    async run(sfdcManager: SalesforceManagerIntf, dataFactory: DataFactoryIntf, logger: SimpleLoggerIntf): Promise<Map<string, SfdcSharingRule>> {

        // List all custom object which can have a sharing model
        logger?.log(`Listing all custom objects that can have a sharing model...`);
        const customObjectsResults = await sfdcManager.soqlQuery([{
            tooling: true,
            string: 'SELECT NamespacePrefix, DeveloperName ' +
                   'FROM CustomObject ' +
                   `WHERE SharingModel != ''`
        }], logger);
        const customObjectNames: any[] = customObjectsResults[0];

        // Read all SharingRules metadata
        logger?.log(`Reading sharing rules metadata via Metadata API...`);
        const results = await sfdcManager.readMetadata([{
            type: SalesforceMetadataTypes.SHARING_RULE,
            members: ['*', ... customObjectNames?.map((r) => `${r.NamespacePrefix ? `${r.NamespacePrefix}__`: ''}${r.DeveloperName}__c`)]
        }], logger);

        // Init the factory and records
        const sharingRuleDataFactory = dataFactory.getInstance(DataAliases.SfdcSharingRule);

        // Create the map
        // Note: The return result from metadata is per object
        const objectRecords: any[] = results.get(SalesforceMetadataTypes.SHARING_RULE) ?? [];
        logger?.log(`Processing sharing rule metadata for ${objectRecords.length} object(s)...`);
        // Then the list of sharing rules will need to be init here...
        const sharingRules: Map<string, SfdcSharingRule> = new Map();
        // ... and loop will be forEach() and not map() (as usual for other datasets we have)
        await MediumProcessor.forEach(objectRecords, async (objectRecord: any) => {

            // At this level we have the name of the object and two lists of sharing rules
            // one being the owner based sharing rules list
            // and the second one being the criteria based sharing rules list
            const object: string = objectRecord.fullName;
            [
                { type: 'OwnerBased',    rules: objectRecord.sharingOwnerRules },
                { type: 'CriteriaBased', rules: objectRecord.sharingCriteriaRules }
            ].forEach((item) => {
                
                // Rules could be undefined
                if (item?.rules === undefined) return;

                // The metadata API may return a single object instead of an array when there is only one rule
                metadata_MakeItArray(item?.rules).forEach((rule) => {

                    rule.criteriaItems = metadata_MakeItArray(rule.criteriaItems);

                    const sharedToType = rule.sharedTo.group ? 'Group' : 
                                        rule.sharedTo.queue ? 'Queue' : 
                                        rule.sharedTo.role ? 'Role' :
                                        rule.sharedTo.roleAndSubordinates ? 'Role and Subordinates' :
                                        rule.sharedTo.roleAndSubordinatesInternal ? 'Role and Subordinates Internals' :
                                        rule.sharedTo.allInternalUsers ? 'All Internal Users' :
                                        rule.sharedTo.allCustomerPortalUsers ? 'All Portal Users' :
                                        'N/A';
                    const sharedToName = rule.sharedTo.group ?? 
                                        rule.sharedTo.queue ?? 
                                        rule.sharedTo.role ?? 
                                        rule.sharedTo.roleAndSubordinates ?? 
                                        rule.sharedTo.roleAndSubordinatesInternal ??
                                        rule.sharedTo.allInternalUsers ?? 
                                        rule.sharedTo.allCustomerPortalUsers ?? 
                                        'N/A';
                    const sharedFromType = rule.sharedFrom?.group ? 'Group' : 
                                        rule.sharedFrom?.queue ? 'Queue' : 
                                        rule.sharedFrom?.role ? 'Role' :
                                        rule.sharedFrom?.roleAndSubordinates ? 'Role and Subordinates' :
                                        rule.sharedFrom?.roleAndSubordinatesInternal ? 'Role and Subordinates Internals' :
                                        rule.sharedFrom?.allInternalUsers ? 'All Internal Users' :
                                        rule.sharedFrom?.allCustomerPortalUsers ? 'All Portal Users' :
                                        'N/A';
                    const sharedFromName = rule.sharedFrom?.group ?? 
                                        rule.sharedFrom?.queue ?? 
                                        rule.sharedFrom?.role ?? 
                                        rule.sharedFrom?.roleAndSubordinates ?? 
                                        rule.sharedFrom?.roleAndSubordinatesInternal ??
                                        rule.sharedFrom?.allInternalUsers ?? 
                                        rule.sharedFrom?.allCustomerPortalUsers ?? 
                                        'N/A';
                    const conditions = item.type === 'OwnerBased' ?
                        [`Owner is in ${sharedFromName} (${sharedFromType})`] :
                        rule.criteriaItems.map((c) => `${c.field} ${c.operation} ${c.value}`)

                    // Create the instance
                    const sharingRule: SfdcSharingRule = sharingRuleDataFactory.createWithScore({
                        properties: {
                            id: `${object}.${item.type}.${rule.fullName}`,
                            name: rule.label,
                            objectType: object,
                            type: item.type,
                            accessLevel: rule.accessLevel,
                            sharedFromConditions: conditions,
                            sharedFromLogic: rule.booleanFilter ?? 'Only ANDs',
                            sharedToType: sharedToType,
                            sharedToName: sharedToName
                        }
                    });

                    // Add it to the map  
                    sharingRules.set(sharingRule.id, sharingRule);
                })
            });
        });

        // Return data as map
        logger?.log(`Done.`);
        return sharingRules;
    }
}