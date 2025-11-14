import { CodeScanner } from '../core/orgcheck-api-codescanner';
import { DataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { Dataset } from '../core/orgcheck-api-dataset';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { Processor } from '../core/orgcheck-api-processor';
import { SalesforceMetadataTypes } from '../core/orgcheck-api-salesforce-metadatatypes';
import { SalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';
import { SFDC_HomePageComponent } from '../data/orgcheck-api-data-homepagecomponent';

export class DatasetHomePageComponents extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @returns {Promise<Map<string, SFDC_HomePageComponent>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First SOQL queries
        logger?.log(`Querying Tooling API about SFDC_HomePageComponent in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            tooling: true,
            string: 'SELECT Id, Name, Body, CreatedDate, LastModifiedDate, NamespacePrefix '+
                    'FROM Homepagecomponent '+
                    `WHERE ManageableState IN ('installedEditable', 'unmanaged')`
        }], logger);

        // Init the factory and records
        const homePageDataFactory = dataFactory.getInstance(SFDC_HomePageComponent);

        // Create the map
        const homePageRecords = results[0];

        // Then retreive dependencies
        logger?.log(`Retrieving dependencies of ${homePageRecords.length} homepage components...`);
        const homePageDependencies = await sfdcManager.dependenciesQuery(
            await Processor.map(homePageRecords, (/** @type {any} */ record) => sfdcManager.caseSafeId(record.Id)), 
            logger
        );

        logger?.log(`Parsing ${homePageRecords.length} homepage components...`);
        const homePages = new Map(await Processor.map(homePageRecords, (/** @type {any} */ record) => {

            // Get the ID15 of this custom field
            const id = sfdcManager.caseSafeId(record.Id);

            // Create the instance
            /** @type {SFDC_HomePageComponent} */
            const homePage = homePageDataFactory.create({
                properties: {
                    id: id,
                    name: record.Name,
                    package: (record.NamespacePrefix || ''),
                    isBodyEmpty: (record.Body ? false : true),
                    createdDate: record.CreatedDate,
                    lastModifiedDate: record.LastModifiedDate,
                    url: sfdcManager.setupUrl(id, SalesforceMetadataTypes.HOME_PAGE_COMPONENT)                    
                },
                dependencyData: homePageDependencies
            });

            // Get information directly from the source code (if available)
            if (record.Body) {
                const bodyCode = CodeScanner.RemoveCommentsFromXML(record.Body);
                homePage.hardCodedURLs = CodeScanner.FindHardCodedURLs(bodyCode);
                homePage.hardCodedIDs = CodeScanner.FindHardCodedIDs(bodyCode);
            }
            
            // Compute the score of this item
            homePageDataFactory.computeScore(homePage);

            // Add it to the map  
            return [ homePage.id, homePage ];
        }));

        // Return data as map
        logger?.log(`Done`);
        return homePages;
    } 
}