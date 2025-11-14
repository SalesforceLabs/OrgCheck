import { CodeScanner } from '../core/orgcheck-api-codescanner';
import { DataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { Dataset } from '../core/orgcheck-api-dataset';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { Processor } from '../core/orgcheck-api-processor';
import { SalesforceMetadataTypes } from '../core/orgcheck-api-salesforce-metadatatypes';
import { SalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';
import { SFDC_VisualForcePage } from '../data/orgcheck-api-data-visualforcepage';

export class DatasetVisualForcePages extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @returns {Promise<Map<string, SFDC_VisualForcePage>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

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
        const pageDataFactory = dataFactory.getInstance(SFDC_VisualForcePage);
        const pageRecords = results[0];

        // Then retreive dependencies
        logger?.log(`Retrieving dependencies of ${pageRecords.length} visualforce pages...`);
        const pagesDependencies = await sfdcManager.dependenciesQuery(
            await Processor.map(pageRecords, (/** @type {any} */ record) => sfdcManager.caseSafeId(record.Id)), 
            logger
        );

        // Create the map
        logger?.log(`Parsing ${pageRecords.length} visualforce pages...`);
        const pages = new Map(await Processor.map(pageRecords, (/** @type {any} */ record) => {

            // Get the ID15
            const id = sfdcManager.caseSafeId(record.Id);

            // Create the instance
            /** @type {SFDC_VisualForcePage} */
            const page = pageDataFactory.create({
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