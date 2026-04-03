import { CodeScanner } from 'src/api/core/orgcheck-api-codescanner';
import { DataAliases } from 'src/api/core/data/orgcheck-api-data-aliases';
import { DataFactoryIntf } from 'src/api/core/data/orgcheck-api-datafactory';
import { Dataset } from 'src/api/core/dataset/orgcheck-api-dataset';
import { SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { Processor } from 'src/api/core/orgcheck-api-processor';
import { SalesforceMetadataTypes } from 'src/api/core/salesforce/orgcheck-api-salesforce-metadatatypes';
import { SalesforceManagerIntf } from 'src/api/core/salesforce/orgcheck-api-salesforcemanager';
import { SfdcVisualForcePage } from 'src/api/data/orgcheck-api-data-visualforcepage';

export class DatasetVisualForcePages implements Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @returns {Promise<Map<string, SfdcVisualForcePage>>} The result of the dataset
     */
    async run(sfdcManager: SalesforceManagerIntf, dataFactory: DataFactoryIntf, logger: SimpleLoggerIntf): Promise<Map<string, SfdcVisualForcePage>> {

        // First SOQL query
        logger?.log(`Querying Tooling API about ApexPage in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            tooling: true,
            string: 'SELECT Id, Name, ApiVersion, NamespacePrefix, Description, IsAvailableInTouch, ' +
                        'Markup, CreatedDate, LastModifiedDate ' +
                    'FROM ApexPage ' +
                    `WHERE ManageableState IN ('installedEditable', 'unmanaged')`
        }], logger);

        // Init the factory and records
        const pageDataFactory = dataFactory.getInstance(DataAliases.SfdcVisualForcePage);
        const pageRecords = results[0];

        // Then retreive dependencies
        logger?.log(`Retrieving dependencies of ${pageRecords?.length} visualforce pages...`);
        const pagesDependencies = await sfdcManager.dependenciesQuery(
            await Processor.map(pageRecords, (/** @type {any} */ record: any) => sfdcManager.caseSafeId(record.Id)), 
            logger
        );

        // Create the map
        logger?.log(`Parsing ${pageRecords?.length} visualforce pages...`);
        const pages: Map<string, SfdcVisualForcePage> = new Map(await Processor.map(pageRecords, (/** @type {any} */ record: any) => {

            // Get the ID15
            const id = sfdcManager.caseSafeId(record.Id);

            // Create the instance
            /** @type {SfdcVisualForcePage} */
            const page: SfdcVisualForcePage = pageDataFactory.create({
                properties: {
                    id: id,
                    name: record.Name,
                    apiVersion: record.ApiVersion,
                    isMobileReady: record.IsAvailableInTouch,
                    package: (record.NamespacePrefix || ''),
                    createdDate: record.CreatedDate,
                    lastModifiedDate: record.LastModifiedDate,
                    description: record.Description,
                    url: sfdcManager.setupUrl(id, SalesforceMetadataTypes.VISUAL_FORCE_PAGE)
                }, 
                dependencyData: pagesDependencies
            });

            // Get information directly from the source code (if available)
            if (record.Markup) {
                const sourceCode = CodeScanner.RemoveCommentsFromCode(record.Markup);
                page.hardCodedURLs = CodeScanner.FindHardCodedURLs(sourceCode);
                page.hardCodedIDs = CodeScanner.FindHardCodedIDs(sourceCode);
            }
            
            // Compute the score of this item
            pageDataFactory.computeScore(page);

            // Add it to the map  
            return [ page.id, page ];
        }));

        // Return data as map
        logger?.log(`Done`);
        return pages;
    } 
}