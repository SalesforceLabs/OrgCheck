import { DataAliases } from 'src/api/core/data/orgcheck-api-data-aliases';
import { DataFactoryIntf } from 'src/api/core/data/orgcheck-api-datafactory';
import { Dataset } from 'src/api/core/dataset/orgcheck-api-dataset';
import { SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { MediumProcessor } from 'src/api/core/orgcheck-api-processor';
import { SalesforceMetadataTypes } from 'src/api/core/salesforce/orgcheck-api-salesforce-metadatatypes';
import { SalesforceManagerIntf } from 'src/api/core/salesforce/orgcheck-api-salesforcemanager';
import { SfdcCustomLabel } from 'src/api/data/orgcheck-api-data-customlabel';

export class DatasetCustomLabels implements Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @returns {Promise<Map<string, SfdcCustomLabel>>} The result of the dataset
     */
    async run(sfdcManager: SalesforceManagerIntf, dataFactory: DataFactoryIntf, logger: SimpleLoggerIntf): Promise<Map<string, SfdcCustomLabel>> {

        // First SOQL query
        logger?.log(`Querying Tooling API about ExternalString in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            tooling: true,
            string: 'SELECT Id, Name, NamespacePrefix, Category, IsProtected, Language, '+
                        'MasterLabel, Value, CreatedDate, LastModifiedDate ' +
                    'FROM ExternalString ' +
                    `WHERE ManageableState IN ('installedEditable', 'unmanaged') `
        }], logger);

        // Init the factory and records
        const labelDataFactory = dataFactory.getInstance(DataAliases.SfdcCustomLabel);
        const customLabelRecords = results[0];

        // Then retreive dependencies
        logger?.log(`Retrieving dependencies of ${customLabelRecords?.length} custom labels...`);
        const customLabelsDependencies = await sfdcManager.dependenciesQuery(
            await MediumProcessor.map(customLabelRecords, (record) => sfdcManager.caseSafeId(record.Id as string)), 
            logger
        );
        
        // Create the map
        logger?.log(`Parsing ${customLabelRecords?.length} custom labels...`);
        const customLabels: Map<string, SfdcCustomLabel> = new Map(await MediumProcessor.map(customLabelRecords, (record) => {

            // Get the ID15 of this custom label
            const id = sfdcManager.caseSafeId(record.Id as string);

            // Create the instance
            const customLabel: SfdcCustomLabel = labelDataFactory.createWithScore({
                properties: {
                    id: id,
                    name: record.Name,
                    package: (record.NamespacePrefix || ''),
                    category: record.Category,
                    isProtected: record.IsProtected === true,
                    language: record.Language,
                    label: record.MasterLabel,
                    value: record.Value,
                    createdDate: record.CreatedDate, 
                    lastModifiedDate: record.LastModifiedDate,
                    url: sfdcManager.setupUrl(id, SalesforceMetadataTypes.CUSTOM_LABEL)
                }, 
                dependencyData: customLabelsDependencies
            });

            // Add it to the map  
            return [ customLabel.id, customLabel ];
        }));

        // Return data as map
        logger?.log(`Done.`);
        return customLabels;
    } 
}