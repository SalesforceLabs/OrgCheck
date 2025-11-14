import { DataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { Dataset } from '../core/orgcheck-api-dataset';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { Processor } from '../core/orgcheck-api-processor';
import { SalesforceMetadataTypes } from '../core/orgcheck-api-salesforce-metadatatypes';
import { SalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';
import { SFDC_CustomLabel } from '../data/orgcheck-api-data-customlabel';

export class DatasetCustomLabels extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @returns {Promise<Map<string, SFDC_CustomLabel>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

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
        const labelDataFactory = dataFactory.getInstance(SFDC_CustomLabel);
        const customLabelRecords = results[0];

        // Then retreive dependencies
        logger?.log(`Retrieving dependencies of ${customLabelRecords.length} custom labels...`);
        const customLabelsDependencies = await sfdcManager.dependenciesQuery(
            await Processor.map(customLabelRecords, (/** @type {any} */ record) => sfdcManager.caseSafeId(record.Id)), 
            logger
        );
        
        // Create the map
        logger?.log(`Parsing ${customLabelRecords.length} custom labels...`);
        const customLabels = new Map(await Processor.map(customLabelRecords, (/** @type {any} */ record) => {

            // Get the ID15 of this custom label
            const id = sfdcManager.caseSafeId(record.Id);

            // Create the instance
            /** @type {SFDC_CustomLabel} */
            const customLabel = labelDataFactory.createWithScore({
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
        logger?.log(`Done`);
        return customLabels;
    } 
}