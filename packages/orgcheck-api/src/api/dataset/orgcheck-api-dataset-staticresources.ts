import { SfdcStaticResource } from 'src/api/data/orgcheck-api-data-staticresource';
import { DataAliases } from 'src/api/core/data/orgcheck-api-data-aliases';
import { DataFactoryIntf } from 'src/api/core/data/orgcheck-api-datafactory';
import { Dataset } from 'src/api/core/dataset/orgcheck-api-dataset';
import { SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { MediumProcessor } from 'src/api/core/orgcheck-api-processor';
import { SalesforceMetadataTypes } from 'src/api/core/salesforce/orgcheck-api-salesforce-metadatatypes';
import { SalesforceManagerIntf } from 'src/api/core/salesforce/orgcheck-api-salesforcemanager';

export class DatasetStaticResources implements Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @returns {Promise<Map<string, SfdcStaticResource>>} The result of the dataset
     */
    async run(sfdcManager: SalesforceManagerIntf, dataFactory: DataFactoryIntf, logger: SimpleLoggerIntf): Promise<Map<string, SfdcStaticResource>> {

        // SOQL query
        logger?.log(`Querying Rest API about StaticResource in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            string: 'SELECT Id, Name, ContentType, CreatedDate, LastModifiedDate, '+
                        'Description, NamespacePrefix '+
                    'FROM StaticResource '
        }], logger);

        // Init the factory and records and records
        const staticResourceDataFactory = dataFactory.getInstance(DataAliases.SfdcStaticResource);
        const staticResourceRecords = results[0];

        // Then retreive dependencies
        logger?.log(`Retrieving dependencies of ${staticResourceRecords?.length} static resources...`);
        const staticResourceDependencies = await sfdcManager.dependenciesQuery(
            await MediumProcessor.map(staticResourceRecords, (record: any) => sfdcManager.caseSafeId(record.Id)), 
            logger
        );

        logger?.log(`Parsing ${staticResourceRecords?.length} static resources...`);
        const staticResources: Map<string, SfdcStaticResource> = new Map(await MediumProcessor.map(staticResourceRecords, async (record: any) => {

            // Get the ID15
            const id = sfdcManager.caseSafeId(record.Id);
            
            // Create the instance
            const staticResource: SfdcStaticResource = staticResourceDataFactory.createWithScore({
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