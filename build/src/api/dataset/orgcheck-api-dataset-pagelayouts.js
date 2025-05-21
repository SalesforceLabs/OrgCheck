import { DataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { Dataset } from '../core/orgcheck-api-dataset';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { Processor } from '../core/orgcheck-api-processing';
import { SalesforceMetadataTypes } from '../core/orgcheck-api-salesforce-metadatatypes';
import { SalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';
import { SFDC_PageLayout } from '../data/orgcheck-api-data-pagelayout';

export class DatasetPageLayouts extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager
     * @param {DataFactoryIntf} dataFactory
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<Map<string, SFDC_PageLayout>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First SOQL queries
        logger?.log(`Querying Tooling API about Layout and ProfileLayout in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            tooling: true,
            string: 'SELECT Id, Name, NamespacePrefix, LayoutType, EntityDefinition.QualifiedApiName, '+
                        'CreatedDate, LastModifiedDate ' +
                    'FROM Layout '
        }, {
            tooling: true,
            string: 'SELECT LayoutId, COUNT(ProfileId) CountAssignment '+
                    'FROM ProfileLayout '+
                    'WHERE Profile.Name != null ' +
                    'GROUP BY LayoutId ',
            queryMoreField: 'CreatedDate'
        }], logger);

        // Init the factory and records
        const pageLayoutDataFactory = dataFactory.getInstance(SFDC_PageLayout);

        // Create the map
        const pageLayoutRecords = results[0];
        const pageLayoutProfileAssignRecords = results[1];

        // Then retreive dependencies
        logger?.log(`Retrieving dependencies of ${pageLayoutRecords.length} page layouts...`);
        const pageLayoutDependencies = await sfdcManager.dependenciesQuery(
            await Processor.map(pageLayoutRecords, (record) => sfdcManager.caseSafeId(record.Id)), 
            logger
        );

        logger?.log(`Parsing ${pageLayoutRecords.length} page layouts...`);
        const pageLayouts = new Map(await Processor.map(pageLayoutRecords, (record) => {

            // Get the ID15 of this page layout
            const id = sfdcManager.caseSafeId(record.Id);

            // Create the instance
            const pageLayout = pageLayoutDataFactory.create({
                properties: {
                    id: id,
                    name: record.Name,
                    package: (record.NamespacePrefix || ''),
                    objectId: record.EntityDefinition?.QualifiedApiName,
                    type: record.LayoutType,
                    profileAssignmentCount: 0,
                    createdDate: record.CreatedDate, 
                    lastModifiedDate: record.LastModifiedDate,
                    url: sfdcManager.setupUrl(id, SalesforceMetadataTypes.PAGE_LAYOUT, record.EntityDefinition?.QualifiedApiName)
                },
                dependencies: {
                    data: pageLayoutDependencies
                }
            });

            // Add it to the map  
            return [ pageLayout.id, pageLayout ];

        }, (record) => { 
            if (!record.EntityDefinition) return false; // ignore if no EntityDefinition linked
            return true;
        }));

        logger?.log(`Parsing ${pageLayoutProfileAssignRecords.length} page layout assignment counts...`);
        await Processor.forEach(pageLayoutProfileAssignRecords, (record) => {

            // Get the ID15 of this page layout
            const id = sfdcManager.caseSafeId(record.LayoutId);

            if (pageLayouts.has(id)) {
                // Get the page layout
                const pageLayout = pageLayouts.get(id);

                // Set the assignment count
                pageLayout.profileAssignmentCount += record.CountAssignment;
            }
        });

        // Compute the score of all items
        await Processor.forEach(pageLayouts, (pageLayout) => {
            pageLayoutDataFactory.computeScore(pageLayout);
        });

        // Return data as map
        logger?.log(`Done`);
        return pageLayouts;
    } 
}