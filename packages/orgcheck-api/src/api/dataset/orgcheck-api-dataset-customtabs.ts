import { CodeScanner } from 'src/api/core/orgcheck-api-codescanner';
import { DataAliases } from 'src/api/core/data/orgcheck-api-data-aliases';
import { DataFactoryIntf } from 'src/api/core/data/orgcheck-api-datafactory';
import { Dataset } from 'src/api/core/dataset/orgcheck-api-dataset';
import { SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { MediumProcessor } from 'src/api/core/orgcheck-api-processor';
import { SalesforceMetadataTypes } from 'src/api/core/salesforce/orgcheck-api-salesforce-metadatatypes';
import { SalesforceManagerIntf } from 'src/api/core/salesforce/orgcheck-api-salesforcemanager';
import { SfdcCustomTab } from 'src/api/data/orgcheck-api-data-customtab';

export class DatasetCustomTabs implements Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @returns {Promise<Map<string, SfdcCustomTab>>} The result of the dataset
     */
    async run(sfdcManager: SalesforceManagerIntf, dataFactory: DataFactoryIntf, logger: SimpleLoggerIntf): Promise<Map<string, SfdcCustomTab>> {

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
        const customTabDataFactory = dataFactory.getInstance(DataAliases.SfdcCustomTab);

        // Create the map
        const customTabRecords = results[0];

        // Then retreive dependencies
        logger?.log(`Retrieving dependencies of ${customTabRecords?.length} custom tabs...`);
        const customTabDependencies = await sfdcManager.dependenciesQuery(
            await MediumProcessor.map(customTabRecords, (record) => sfdcManager.caseSafeId(record.Id as string)), 
            logger
        );

        logger?.log(`Parsing ${customTabRecords?.length} custom tabs...`);
        const customTabs: Map<string, SfdcCustomTab> = new Map(await MediumProcessor.map(customTabRecords, (record) => {

            // Get the ID15 of this custom field
            const id = sfdcManager.caseSafeId(record.Id as string);

            // Create the instance
            const customTab: SfdcCustomTab = customTabDataFactory.createWithScore({
                properties: {
                    id: id,
                    name: record.DeveloperName || `${id} (No name from API!)`,
                    package: (record.NamespacePrefix || ''),
                    type: record.Type,
                    description: record.Description,
                    createdDate: record.CreatedDate,
                    lastModifiedDate: record.LastModifiedDate,
                    hardCodedURLs: CodeScanner.FindHardCodedURLs(record.Url as string),
                    hardCodedIDs: CodeScanner.FindHardCodedIDs(record.Url as string),
                    url: sfdcManager.setupUrl(id, SalesforceMetadataTypes.CUSTOM_TAB)                    
                },
                dependencyData: customTabDependencies
            });

            // Add it to the map  
            return [ customTab.id, customTab ];
        }));

        // Return data as map
        logger?.log(`Done.`);
        return customTabs;
    } 
}