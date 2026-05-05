import { DataAliases } from 'src/api/core/data/orgcheck-api-data-aliases';
import { DataFactoryIntf } from 'src/api/core/data/orgcheck-api-datafactory';
import { Dataset } from 'src/api/core/dataset/orgcheck-api-dataset';
import { SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { MediumProcessor } from 'src/api/core/orgcheck-api-processor';
import { SalesforceMetadataTypes } from 'src/api/core/salesforce/orgcheck-api-salesforce-metadatatypes';
import { SalesforceManagerIntf } from 'src/api/core/salesforce/orgcheck-api-salesforcemanager';
import { SfdcPageLayout } from 'src/api/data/orgcheck-api-data-pagelayout';

export class DatasetPageLayouts implements Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @returns {Promise<Map<string, SfdcPageLayout>>} The result of the dataset
     */
    async run(sfdcManager: SalesforceManagerIntf, dataFactory: DataFactoryIntf, logger: SimpleLoggerIntf): Promise<Map<string, SfdcPageLayout>> {

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
        const pageLayoutDataFactory = dataFactory.getInstance(DataAliases.SfdcPageLayout);

        // Create the map
        const pageLayoutRecords = results[0];
        const pageLayoutProfileAssignRecords = results[1];

        // Get the page layout Ids
        const pageLayoutIds = await MediumProcessor.map(pageLayoutRecords, (record: any) => sfdcManager.caseSafeId(record.Id))

        // Then retreive dependencies
        logger?.log(`Retrieving dependencies of ${pageLayoutRecords?.length} page layouts...`);
        const pageLayoutDependencies = await sfdcManager.dependenciesQuery(pageLayoutIds, logger);

        logger?.log(`Parsing ${pageLayoutRecords?.length} page layouts...`);
        const pageLayouts: Map<string, SfdcPageLayout> = new Map(await MediumProcessor.map(pageLayoutRecords, (record: any) => {

            // Get the ID15 of this page layout
            const id = sfdcManager.caseSafeId(record.Id);

            // Create the instance
            const pageLayout: SfdcPageLayout = pageLayoutDataFactory.create({
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

        }, (record: any) => { 
            if (!record.EntityDefinition) return false; // ignore if no EntityDefinition linked
            return true;
        }));

        logger?.log(`Parsing ${pageLayoutProfileAssignRecords?.length} page layout assignment counts...`);
        await MediumProcessor.forEach(pageLayoutProfileAssignRecords, async (record: any) => {

            // Get the ID15 of this page layout
            const id = sfdcManager.caseSafeId(record.LayoutId);

            // Get the page layout
            const pageLayout = pageLayouts.get(id);
            if (pageLayout) {

                // Set the assignment count
                pageLayout.profileAssignmentCount += record.CountAssignment;
            }
        });

        // Get information about the previous identified page layouts using metadata api
        logger?.log(`Calling Tooling API Composite to get more information about these ${pageLayoutIds?.length} page layouts...`);
        const pageLayoutMetadataRecords = await sfdcManager.readMetadataAtScale('Layout', pageLayoutIds, [ 'FIELD_INTEGRITY_EXCEPTION', 'UNKNOWN_EXCEPTION', 'INSUFFICIENT_ACCESS' ], logger);

        logger?.log(`Parsing ${pageLayoutMetadataRecords?.length} page layout metadata information...`);
        await MediumProcessor.forEach(pageLayoutMetadataRecords, async (metadataRecord: any) => {

            // Get the ID15 of this page layout
            const id = sfdcManager.caseSafeId(metadataRecord.Id);

            // Get the page layout
            const pageLayout = pageLayouts.get(id);
            if (pageLayout) {

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
        await MediumProcessor.forEach(pageLayouts, async (pageLayout: SfdcPageLayout) => {
            pageLayoutDataFactory.computeScore(pageLayout);
        });

        // Return data as map
        logger?.log(`Done.`);
        return pageLayouts;
    } 
}