import { CodeScanner } from '../core/orgcheck-api-codescanner';
import { DataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { Dataset } from '../core/orgcheck-api-dataset';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { Processor } from '../core/orgcheck-api-processor';
import { SalesforceMetadataTypes } from '../core/orgcheck-api-salesforce-metadatatypes';
import { SalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';
import { SFDC_VisualForceComponent } from '../data/orgcheck-api-data-visualforcecomponent';

export class DatasetVisualForceComponents extends Dataset {
    
    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @returns {Promise<Map<string, SFDC_VisualForceComponent>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First SOQL query
        logger?.log(`Querying Tooling API about ApexComponent in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            tooling: true,
            string: 'SELECT Id, Name, ApiVersion, NamespacePrefix, Description, ' +
                        'Markup, CreatedDate, LastModifiedDate ' +
                    'FROM ApexComponent ' +
                    `WHERE ManageableState IN ('installedEditable', 'unmanaged') `
        }], logger);

        // Init the factory and records
        const componentDataFactory = dataFactory.getInstance(SFDC_VisualForceComponent);
        const componentRecords = results[0];

        // Then retreive dependencies
        logger?.log(`Retrieving dependencies of ${componentRecords.length} visualforce components...`);
        const componentsDependencies = await sfdcManager.dependenciesQuery(
            await Processor.map(componentRecords, (/** @type {any} */ record) => sfdcManager.caseSafeId(record.Id)), 
            logger
        );

        // Create the map
        logger?.log(`Parsing ${componentRecords.length} visualforce components...`);
        const components = new Map(await Processor.map(componentRecords, (/** @type {any} */ record) => {

            // Get the ID15 of this custom field
            const id = sfdcManager.caseSafeId(record.Id);

            // Create the instance
            /** @type {SFDC_VisualForceComponent} */
            const component = componentDataFactory.create({
                properties: {
                    id: id,
                    name: record.Name,
                    apiVersion: record.ApiVersion,
                    package: (record.NamespacePrefix || ''),
                    createdDate: record.CreatedDate,
                    lastModifiedDate: record.LastModifiedDate,
                    description: record.Description,
                    url: sfdcManager.setupUrl(id, SalesforceMetadataTypes.VISUAL_FORCE_COMPONENT)
                }, 
                dependencyData: componentsDependencies
            });

            // Get information directly from the source code (if available)
            if (record.Markup) {
                const sourceCode = CodeScanner.RemoveCommentsFromCode(record.Markup);
                component.hardCodedURLs = CodeScanner.FindHardCodedURLs(sourceCode);
                component.hardCodedIDs = CodeScanner.FindHardCodedIDs(sourceCode);
            }

            // Compute the score of this item
            componentDataFactory.computeScore(component);

            // Add it to the map  
            return [ component.id, component ];
        }));

        // Return data as map
        logger?.log(`Done`);
        return components;
    } 
}