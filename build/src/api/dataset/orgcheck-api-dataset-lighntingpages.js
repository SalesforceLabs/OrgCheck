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

        // Then retreive dependencies
        logger?.log(`Retrieving dependencies of ${pageRecords.length} lightning pages...`);
        const pagesDependencies = await sfdcManager.dependenciesQuery(
            await Processor.map(pageRecords, (/** @type {any} */ record) => sfdcManager.caseSafeId(record.Id)), 
            logger
        );

        // Create the map
        logger?.log(`Parsing ${pageRecords.length} lightning pages...`);
        const pages = new Map(await Processor.map(pageRecords, (/** @type {any} */ record) => {

            // Get the ID15
            const id = sfdcManager.caseSafeId(record.Id);

            // Create the instance
            const page = pageDataFactory.createWithScore({
                properties: {
                    id: id,
                    name: record.MasterLabel,
                    type: record.Type,
                    package: (record.NamespacePrefix || ''),
                    createdDate: record.CreatedDate,
                    lastModifiedDate: record.LastModifiedDate,
                    description: record.Description,
                    objectId: (record.EntityDefinition?.QualifiedApiName || ''),
                    url: sfdcManager.setupUrl(id, SalesforceMetadataTypes.LIGHTNING_PAGE)
                }, 
                dependencyData: pagesDependencies
            });

            // Add it to the map  
            return [ page.id, page ];
        }));

        // Return data as map
        logger?.log(`Done`);
        return pages;
    } 
}