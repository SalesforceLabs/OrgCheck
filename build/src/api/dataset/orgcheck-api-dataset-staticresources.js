import { SFDC_StaticResource } from '../data/orgcheck-api-data-staticresource';
import { DataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { Dataset } from '../core/orgcheck-api-dataset';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { Processor } from '../core/orgcheck-api-processor';
import { SalesforceMetadataTypes } from '../core/orgcheck-api-salesforce-metadatatypes';
import { SalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';

export class DatasetStaticResources extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @returns {Promise<Map<string, SFDC_StaticResource>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // SOQL query
        logger?.log(`Querying Rest API about StaticResource in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            string: 'SELECT Id, Name, ContentType, CreatedDate, LastModifiedDate, '+
                        'Description, NamespacePrefix '+
                    'FROM StaticResource '
        }], logger);

        // Init the factory and records and records
        const staticResourceDataFactory = dataFactory.getInstance(SFDC_StaticResource);
        const staticResourceRecords = results[0];

        // Then retreive dependencies
        logger?.log(`Retrieving dependencies of ${staticResourceRecords.length} static resources...`);
        const staticResourceDependencies = await sfdcManager.dependenciesQuery(
            await Processor.map(staticResourceRecords, (/** @type {any} */ record) => sfdcManager.caseSafeId(record.Id)), 
            logger
        );

        logger?.log(`Parsing ${staticResourceRecords.length} static resources...`);
        /** @type {Map<string, SFDC_StaticResource>} */
        const staticResources = new Map(await Processor.map(staticResourceRecords, async (/** @type {any} */ record) => {

            // Get the ID15
            const id = sfdcManager.caseSafeId(record.Id);
            
            // Create the instance
            /** @type {SFDC_StaticResource} */
            const staticResource = staticResourceDataFactory.createWithScore({
                properties: {
                    id: id,
                    name: record.Name,
                    description: record.Description,
                    package: (record.NamespacePrefix || ''),
                    contentType: record.ContentType, 
                    createdDate: record.CreatedDate,
                    lastModifiedDate: record.LastModifiedDate,
                    url: sfdcManager.setupUrl(id, SalesforceMetadataTypes.STATIC_RESOURCE)
                }, 
                dependencyData: staticResourceDependencies
            });

            // Add it to the map  
            return [ staticResource.id, staticResource ];
        }));

        // Return data as map
        logger?.log(`Done`);
        return staticResources;
    } 
}