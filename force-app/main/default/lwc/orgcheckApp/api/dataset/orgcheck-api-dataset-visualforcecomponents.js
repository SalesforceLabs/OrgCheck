import { OrgCheckDataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { OrgCheckSimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';
import { OrgCheckSalesforceMetadataTypes } from '../core/orgcheck-api-salesforce-metadatatypes';
import { OrgCheckSalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';
import { SFDC_VisualForceComponent } from '../data/orgcheck-api-data-visualforcecomponent';

export class OrgCheckDatasetVisualForceComponents extends OrgCheckDataset {
    
    /**
     * @description Run the dataset and return the result
     * @param {OrgCheckSalesforceManagerIntf} sfdcManager
     * @param {OrgCheckDataFactoryIntf} dataFactory
     * @param {OrgCheckSimpleLoggerIntf} logger
     * @returns {Promise<Map<string, SFDC_VisualForceComponent>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First SOQL query
        logger?.log(`Querying Tooling API about ApexComponent in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            tooling: true,
            string: 'SELECT Id, Name, ApiVersion, NamespacePrefix, Description, ' +
                        'CreatedDate, LastModifiedDate ' +
                    'FROM ApexComponent ' +
                    `WHERE ManageableState IN ('installedEditable', 'unmanaged') `
        }], logger);

        // Init the factory and records
        const componentDataFactory = dataFactory.getInstance(SFDC_VisualForceComponent);
        const componentRecords = results[0];

        // Then retreive dependencies
        logger?.log(`Retrieving dependencies of ${componentRecords.length} visualforce components...`);
        const componentsDependencies = await sfdcManager.dependenciesQuery(
            await OrgCheckProcessor.map(componentRecords, (record) => sfdcManager.caseSafeId(record.Id)), 
            logger
        );

        // Create the map
        logger?.log(`Parsing ${componentRecords.length} visualforce components...`);
        const components = new Map(await OrgCheckProcessor.map(componentRecords, (record) => {

            // Get the ID15 of this custom field
            const id = sfdcManager.caseSafeId(record.Id);

            // Create the instance
            const component = componentDataFactory.createWithScore({
                properties: {
                    id: id,
                    name: record.Name,
                    apiVersion: record.ApiVersion,
                    package: (record.NamespacePrefix || ''),
                    createdDate: record.CreatedDate,
                    lastModifiedDate: record.LastModifiedDate,
                    description: record.Description,
                    url: sfdcManager.setupUrl(id, OrgCheckSalesforceMetadataTypes.VISUAL_FORCE_COMPONENT)
                }, 
                _dependencies: {
                    data: componentsDependencies
                },
                get dependencies() {
                    return this._dependencies;
                },
                set dependencies(value) {
                    this._dependencies = value;
                },
            });

            // Add it to the map  
            return [ component.id, component ];
        }));

        // Return data as map
        logger?.log(`Done`);
        return components;
    } 
}