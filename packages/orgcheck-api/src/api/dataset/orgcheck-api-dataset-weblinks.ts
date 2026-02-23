import { CodeScanner } from 'src/api/core/orgcheck-api-codescanner';
import { DataAliases } from 'src/api/core/orgcheck-api-data-aliases';
import { DataFactoryIntf } from 'src/api/core/orgcheck-api-datafactory';
import { Dataset } from 'src/api/core/orgcheck-api-dataset';
import { SimpleLoggerIntf } from 'src/api/core/orgcheck-api-logger';
import { Processor } from 'src/api/core/orgcheck-api-processor';
import { SalesforceMetadataTypes } from 'src/api/core/orgcheck-api-salesforce-metadatatypes';
import { SalesforceManagerIntf } from 'src/api/core/orgcheck-api-salesforcemanager';
import { SFDC_WebLink } from 'src/api/data/orgcheck-api-data-weblink';

export class DatasetWeblinks implements Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @returns {Promise<Map<string, SFDC_WebLink>>} The result of the dataset
     */
    async run(sfdcManager: SalesforceManagerIntf, dataFactory: DataFactoryIntf, logger: SimpleLoggerIntf): Promise<Map<string, SFDC_WebLink>> {

        // First SOQL query
        logger?.log(`Querying REST API about WebLinks in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            string: 'SELECT Id, Name, Url, LinkType, OpenType, Description, CreatedDate, ' +
                    'LastModifiedDate, NamespacePrefix, EntityDefinition.DurableId '+
                    'FROM WebLink '+
                    `WHERE ManageableState IN ('installedEditable', 'unmanaged') `,
            tooling: true
        }], logger);
        
        // Init the factory and records
        const webLinkDataFactory = dataFactory.getInstance(DataAliases.SFDC_WebLink);

        // Create the map
        const webLinkRecords = results[0];

        // Then retreive dependencies
        logger?.log(`Retrieving dependencies of ${webLinkRecords?.length} web links...`);
        const webLinkDependencies = await sfdcManager.dependenciesQuery(
            await Processor.map(webLinkRecords, (/** @type {any} */ record: any) => sfdcManager.caseSafeId(record.Id)), 
            logger
        );

        // Create the map
        logger?.log(`Parsing ${webLinkRecords?.length} weblinks...`);
        const webLinks: Map<string, SFDC_WebLink> = new Map(await Processor.map(webLinkRecords, async (/** @type {any} */ record: any) => {

            // Get the ID15
            const id = sfdcManager.caseSafeId(record.Id);

            // Create the instance
            /** @type {SFDC_WebLink} */
            const webLink: SFDC_WebLink = webLinkDataFactory.createWithScore({
                properties: {
                    id: id,
                    name: record.Name, 
                    hardCodedURLs: CodeScanner.FindHardCodedURLs(record.Url),
                    hardCodedIDs: CodeScanner.FindHardCodedIDs(record.Url),
                    type: record.LinkType,
                    behavior: record.OpenType,
                    package: (record.NamespacePrefix || ''),
                    createdDate: record.CreatedDate,
                    lastModifiedDate: record.LastModifiedDate,
                    description: record.Description,
                    objectId: record.EntityDefinition?.DurableId,
                    url: sfdcManager.setupUrl(record.Id, SalesforceMetadataTypes.WEB_LINK, record.PageOrSobjectType)
                },
                dependencyData: webLinkDependencies
            });

            // Add it to the map  
            return [ webLink.id, webLink ];
        }));

        // Return data as map
        logger?.log(`Done`);
        return webLinks;
    } 
}