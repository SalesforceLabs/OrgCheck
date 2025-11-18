import { DataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { Dataset } from '../core/orgcheck-api-dataset';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { Processor } from '../core/orgcheck-api-processor';
import { SalesforceMetadataTypes } from '../core/orgcheck-api-salesforce-metadatatypes';
import { SalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';
import { SFDC_LightningPage } from '../data/orgcheck-api-data-lightningpage';

export class DatasetLightningPages extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @returns {Promise<Map<string, SFDC_LightningPage>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First SOQL query
        logger?.log(`Querying Tooling API about FlexiPage in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            tooling: true,
            string: 'SELECT Id, MasterLabel, EntityDefinition.QualifiedApiName, ' +
                        'Type, NamespacePrefix, Description, ' +
                        'CreatedDate, LastModifiedDate ' +
                    'FROM FlexiPage ' +
                    `WHERE ManageableState IN ('installedEditable', 'unmanaged') `
        }], logger);

        // Init the factory and records
        const pageDataFactory = dataFactory.getInstance(SFDC_LightningPage);
        const pageRecords = results[0];

        // Get the page Ids
        const pageIds = await Processor.map(pageRecords, (/** @type {any} */ record) => sfdcManager.caseSafeId(record.Id))

        // Then retreive dependencies
        logger?.log(`Retrieving dependencies of ${pageRecords.length} lightning pages...`);
        const pagesDependencies = await sfdcManager.dependenciesQuery(pageIds, logger);

        // Create the map
        logger?.log(`Parsing ${pageRecords.length} lightning pages...`);
        const pages = new Map(await Processor.map(pageRecords, (/** @type {any} */ record) => {

            // Get the ID15
            const id = sfdcManager.caseSafeId(record.Id);

            // Create the instance
            /** @type {SFDC_LightningPage} */
            const page = pageDataFactory.create({
                properties: {
                    id: id,
                    name: record.MasterLabel,
                    type: record.Type,
                    package: (record.NamespacePrefix || ''),
                    createdDate: record.CreatedDate,
                    lastModifiedDate: record.LastModifiedDate,
                    description: record.Description,
                    objectId: (record.EntityDefinition?.QualifiedApiName || ''),
                    nbComponents: 0,
                    nbFields: 0,
                    nbRelatedLists: 0,
                    isAttachmentRelatedListIncluded: false,
                    isRelatedListFromPageLayoutIncluded: false,
                    url: sfdcManager.setupUrl(id, SalesforceMetadataTypes.LIGHTNING_PAGE)
                }, 
                dependencyData: pagesDependencies
            });

            // Add it to the map  
            return [ page.id, page ];
        }));

        // Get information about the previous identified page using metadata api
        logger?.log(`Calling Tooling API Composite to get more information about these ${pageIds.length} lightning pages...`);
        const flexipageMetadataRecords = await sfdcManager.readMetadataAtScale('FlexiPage', pageIds, [ 'FIELD_INTEGRITY_EXCEPTION', 'UNKNOWN_EXCEPTION' ], logger);

        logger?.log(`Parsing ${flexipageMetadataRecords.length} lightning pages metadata information...`);
        await Processor.forEach(flexipageMetadataRecords, (/** @type {any} */ metadataRecord) => {

            // Get the ID15 of this lightning page
            const id = sfdcManager.caseSafeId(metadataRecord.Id);

            if (pages.has(id)) {
                // Get the page layout
                /** @type {SFDC_LightningPage} */
                const page = pages.get(id);

                // Set the metadata info
                metadataRecord?.Metadata?.flexiPageRegions?.forEach((region) => {
                    region?.itemInstances?.forEach((item) => {
                        if (item.componentInstance && item.fieldInstance === null) {
                            page.nbComponents++;
                            const instance = item.componentInstance;
                            switch (instance?.componentName) {
                                case 'force:relatedListContainer': {
                                    page.isRelatedListFromPageLayoutIncluded = true;
                                    page.nbRelatedLists++;
                                    break;
                                }
                                case 'force:relatedListSingleContainer': {
                                    if (page.isAttachmentRelatedListIncluded === false) {
                                        page.isAttachmentRelatedListIncluded = instance?.componentInstanceProperties?.some(
                                            (p) => p.name === 'relatedListApiName' && p.value === 'CombinedAttachments'
                                        ) ?? false;
                                    }
                                    page.nbRelatedLists++;
                                    break;
                                }
                                default:
                                    // do nothing!
                            }
                        } else if (item.fieldInstance && item.componentInstance === null) {
                            page.nbFields++;
                        }
                    });
                });
            }
        });

        // Compute the score of all items
        await Processor.forEach(pages, (/** @type {SFDC_LightningPage} */ page) => {
            pageDataFactory.computeScore(page);
        });

        // Return data as map
        logger?.log(`Done`);
        return pages;
    } 
}