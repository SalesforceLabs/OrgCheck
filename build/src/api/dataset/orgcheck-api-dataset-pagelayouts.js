import { DataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { Dataset } from '../core/orgcheck-api-dataset';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { Processor } from '../core/orgcheck-api-processor';
import { SalesforceMetadataTypes } from '../core/orgcheck-api-salesforce-metadatatypes';
import { SalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';
import { SFDC_PageLayout } from '../data/orgcheck-api-data-pagelayout';

export class DatasetPageLayouts extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @returns {Promise<Map<string, SFDC_PageLayout>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First SOQL queries
        logger?.log(`Querying Tooling API about Layout and ProfileLayout in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            tooling: true,
            string: 'SELECT Id, Name, NamespacePrefix, LayoutType, EntityDefinition.DurableId, ' +
                        'EntityDefinition.QualifiedApiName, CreatedDate, LastModifiedDate ' +
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

        // Get the page layout Ids
        const pageLayoutIds = await Processor.map(pageLayoutRecords, (/** @type {any} */ record) => sfdcManager.caseSafeId(record.Id))

        // Then retreive dependencies
        logger?.log(`Retrieving dependencies of ${pageLayoutRecords.length} page layouts...`);
        const pageLayoutDependencies = await sfdcManager.dependenciesQuery(pageLayoutIds, logger);

        logger?.log(`Parsing ${pageLayoutRecords.length} page layouts...`);
        const pageLayouts = new Map(await Processor.map(pageLayoutRecords, (/** @type {any} */ record) => {

            // Get the ID15 of this page layout
            const id = sfdcManager.caseSafeId(record.Id);

            // Create the instance
            /** @type {SFDC_PageLayout} */
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
                    url: sfdcManager.setupUrl(id, SalesforceMetadataTypes.PAGE_LAYOUT, record.EntityDefinition?.DurableId)
                },
                dependencyData: pageLayoutDependencies
            });

            // Add it to the map  
            return [ pageLayout.id, pageLayout ];

        }, (/** @type {any} */ record) => { 
            if (!record.EntityDefinition) return false; // ignore if no EntityDefinition linked
            return true;
        }));

        logger?.log(`Parsing ${pageLayoutProfileAssignRecords.length} page layout assignment counts...`);
        await Processor.forEach(pageLayoutProfileAssignRecords, (/** @type {any} */ record) => {

            // Get the ID15 of this page layout
            const id = sfdcManager.caseSafeId(record.LayoutId);

            if (pageLayouts.has(id)) {
                // Get the page layout
                const pageLayout = pageLayouts.get(id);

                // Set the assignment count
                pageLayout.profileAssignmentCount += record.CountAssignment;
            }
        });

        // Get information about the previous identified page layouts using metadata api
        logger?.log(`Calling Tooling API Composite to get more information about these ${pageLayoutIds.length} page layouts...`);
        const pageLayoutMetadataRecords = await sfdcManager.readMetadataAtScale('Layout', pageLayoutIds, [ 'FIELD_INTEGRITY_EXCEPTION', 'UNKNOWN_EXCEPTION' ], logger);

        logger?.log(`Parsing ${pageLayoutMetadataRecords.length} page layout metadata information...`);
        await Processor.forEach(pageLayoutMetadataRecords, (/** @type {any} */ metadataRecord) => {

            // Get the ID15 of this page layout
            const id = sfdcManager.caseSafeId(metadataRecord.Id);

            if (pageLayouts.has(id)) {
                // Get the page layout
                const pageLayout = pageLayouts.get(id);

                // Set the metadata info
                pageLayout.nbRelatedLists = metadataRecord?.Metadata?.relatedLists?.length ?? 0;
                pageLayout.isAttachmentRelatedListIncluded = metadataRecord?.Metadata?.relatedLists?.some((relList) => relList.relatedList === 'RelatedNoteList') ?? false;
                pageLayout.nbFields = 0;
                metadataRecord?.Metadata?.layoutSections?.forEach((section) => {
                    section?.layoutColumns?.forEach((column) => {
                        column?.layoutItems?.forEach((item) => {
                            if (item.field) pageLayout.nbFields++;
                        });
                    });
                });
            }
        });

        // Compute the score of all items
        await Processor.forEach(pageLayouts, (/** @type {SFDC_PageLayout} */ pageLayout) => {
            pageLayoutDataFactory.computeScore(pageLayout);
        });

        // Return data as map
        logger?.log(`Done`);
        return pageLayouts;
    } 
}