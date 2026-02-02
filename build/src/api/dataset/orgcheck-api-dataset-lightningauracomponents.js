import { DataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { Dataset } from '../core/orgcheck-api-dataset';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { Processor } from '../core/orgcheck-api-processor';
import { SalesforceMetadataTypes } from '../core/orgcheck-api-salesforce-metadatatypes';
import { SalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';
import { SFDC_LightningAuraComponent } from '../data/orgcheck-api-data-lightningauracomponent';

export class DatasetLightningAuraComponents extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @returns {Promise<Map<string, SFDC_LightningAuraComponent>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First SOQL query
        logger?.log(`Querying Tooling API about AuraDefinitionBundle in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            tooling: true,
            string: 'SELECT Id, MasterLabel, ApiVersion, NamespacePrefix, Description, ' +
                        'CreatedDate, LastModifiedDate ' +
                    'FROM AuraDefinitionBundle ' +
                    `WHERE ManageableState IN ('installedEditable', 'unmanaged') `
        }], logger);

        // Init the factory and records
        const componentDataFactory = dataFactory.getInstance(SFDC_LightningAuraComponent);
        const componentRecords = results[0];

        // Then retreive dependencies
        logger?.log(`Retrieving dependencies of ${componentRecords.length} lightning aura components...`);
        const componentsDependencies = await sfdcManager.dependenciesQuery(
            await Processor.map(componentRecords, (/** @type {any} */ record) => sfdcManager.caseSafeId(record.Id)), 
            logger
        );
        
        // Create the map
        logger?.log(`Parsing ${componentRecords.length} lightning aura components...`);
        const components = new Map(await Processor.map(componentRecords, (/** @type {any} */ record) => {

            // Get the ID15 of this custom field
            const id = sfdcManager.caseSafeId(record.Id);

            // Create the instance
            /** @type {SFDC_LightningAuraComponent} */
            const component = componentDataFactory.createWithScore({
                properties: {
                    id: id,
                    name: record.MasterLabel,
                    apiVersion: record.ApiVersion,
                    package: (record.NamespacePrefix || ''),
                    createdDate: record.CreatedDate,
                    lastModifiedDate: record.LastModifiedDate,
                    description: record.Description,
                    url: sfdcManager.setupUrl(id, SalesforceMetadataTypes.AURA_WEB_COMPONENT)
                }, 
                dependencyData: componentsDependencies
            });

            // Add it to the map  
            return [ component.id, component ];
        }));

        // Return data as map
        logger?.log(`Done`);
        return components;
    } 
}