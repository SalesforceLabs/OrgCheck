import { CodeScanner } from '../core/orgcheck-api-codescanner';
import { DataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { Dataset } from '../core/orgcheck-api-dataset';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { Processor } from '../core/orgcheck-api-processor';
import { SalesforceMetadataTypes } from '../core/orgcheck-api-salesforce-metadatatypes';
import { SalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';
import { SFDC_CustomTab } from '../data/orgcheck-api-data-customtab';

export class DatasetCustomTabs extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @returns {Promise<Map<string, SFDC_CustomTab>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First SOQL queries
        logger?.log(`Querying Tooling API about CustomTab in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            tooling: true,
            string: 'SELECT Id, DeveloperName, Type, Url, CreatedDate, Description, ' +
                        'LastModifiedDate, NamespacePrefix '+
                    'FROM CustomTab '+
                    `WHERE ManageableState IN ('installedEditable', 'unmanaged')`
        }], logger);

        // Init the factory and records
        const customTabDataFactory = dataFactory.getInstance(SFDC_CustomTab);

        // Create the map
        const customTabRecords = results[0];

        // Then retreive dependencies
        logger?.log(`Retrieving dependencies of ${customTabRecords.length} custom tabs...`);
        const customTabDependencies = await sfdcManager.dependenciesQuery(
            await Processor.map(customTabRecords, (/** @type {any} */ record) => sfdcManager.caseSafeId(record.Id)), 
            logger
        );

        logger?.log(`Parsing ${customTabRecords.length} custom tabs...`);
        const customTabs = new Map(await Processor.map(customTabRecords, (/** @type {any} */ record) => {

            // Get the ID15 of this custom field
            const id = sfdcManager.caseSafeId(record.Id);

            // Create the instance
            /** @type {SFDC_CustomTab} */
            const customTab = customTabDataFactory.createWithScore({
                properties: {
                    id: id,
                    name: record.DeveloperName || `${id} (No name from API!)`,
                    package: (record.NamespacePrefix || ''),
                    type: record.Type,
                    description: record.Description,
                    createdDate: record.CreatedDate,
                    lastModifiedDate: record.LastModifiedDate,
                    hardCodedURLs: CodeScanner.FindHardCodedURLs(record.Url),
                    hardCodedIDs: CodeScanner.FindHardCodedIDs(record.Url),
                    url: sfdcManager.setupUrl(id, SalesforceMetadataTypes.CUSTOM_TAB)                    
                },
                dependencyData: customTabDependencies
            });

            // Add it to the map  
            return [ customTab.id, customTab ];
        }));

        // Return data as map
        logger?.log(`Done`);
        return customTabs;
    } 
}