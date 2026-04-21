import { CodeScanner } from 'src/api/core/orgcheck-api-codescanner';
import { DataAliases } from 'src/api/core/data/orgcheck-api-data-aliases';
import { DataFactoryIntf } from 'src/api/core/data/orgcheck-api-datafactory';
import { Dataset } from 'src/api/core/dataset/orgcheck-api-dataset';
import { SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { MediumProcessor } from 'src/api/core/orgcheck-api-processor';
import { SalesforceMetadataTypes } from 'src/api/core/salesforce/orgcheck-api-salesforce-metadatatypes';
import { SalesforceManagerIntf } from 'src/api/core/salesforce/orgcheck-api-salesforcemanager';
import { SfdcHomePageComponent } from 'src/api/data/orgcheck-api-data-homepagecomponent';

export class DatasetHomePageComponents implements Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @returns {Promise<Map<string, SfdcHomePageComponent>>} The result of the dataset
     */
    async run(sfdcManager: SalesforceManagerIntf, dataFactory: DataFactoryIntf, logger: SimpleLoggerIntf): Promise<Map<string, SfdcHomePageComponent>> {

        // First SOQL queries
        logger?.log(`Querying Tooling API about SfdcHomePageComponent in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            tooling: true,
            string: 'SELECT Id, Name, Body, CreatedDate, LastModifiedDate, NamespacePrefix '+
                    'FROM Homepagecomponent '+
                    `WHERE ManageableState IN ('installedEditable', 'unmanaged')`
        }], logger);

        // Init the factory and records
        const homePageDataFactory = dataFactory.getInstance(DataAliases.SfdcHomePageComponent);

        // Create the map
        const homePageRecords = results[0];

        // Then retreive dependencies
        logger?.log(`Retrieving dependencies of ${homePageRecords?.length} homepage components...`);
        const homePageDependencies = await sfdcManager.dependenciesQuery(
            await MediumProcessor.map(homePageRecords, (record: any) => sfdcManager.caseSafeId(record.Id)), 
            logger
        );

        logger?.log(`Parsing ${homePageRecords?.length} homepage components...`);
        const homePages: Map<string, SfdcHomePageComponent> = new Map(await MediumProcessor.map(homePageRecords, (record: any) => {

            // Get the ID15 of this custom field
            const id = sfdcManager.caseSafeId(record.Id);

            // Create the instance
            const homePage: SfdcHomePageComponent = homePageDataFactory.create({
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