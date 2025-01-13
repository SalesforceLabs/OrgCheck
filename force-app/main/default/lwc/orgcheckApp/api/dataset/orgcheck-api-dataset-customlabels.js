import { OrgCheckDataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { OrgCheckSimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';
import { OrgCheckSalesforceMetadataTypes } from '../core/orgcheck-api-salesforce-metadatatypes';
import { OrgCheckSalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';
import { SFDC_CustomLabel } from '../data/orgcheck-api-data-customlabel';

export class OrgCheckDatasetCustomLabels extends OrgCheckDataset {

    /**
     * @description Run the dataset and return the result
     * @param {OrgCheckSalesforceManagerIntf} sfdcManager
     * @param {OrgCheckDataFactoryIntf} dataFactory
     * @param {OrgCheckSimpleLoggerIntf} logger
     * @returns {Promise<Map<string, SFDC_CustomLabel>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First SOQL query
        logger?.log(`Querying Tooling API about ExternalString in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            tooling: true,
            string: 'SELECT Id, Name, NamespacePrefix, Category, IsProtected, Language, '+
                        'MasterLabel, Value, CreatedDate, LastModifiedDate ' +
                    'FROM ExternalString ' +
                    `WHERE ManageableState IN ('installedEditable', 'unmanaged') `
        }], logger);

        // Init the factory and records
        const labelDataFactory = dataFactory.getInstance(SFDC_CustomLabel);
        const customLabelRecords = results[0];

        // Then retreive dependencies
        logger?.log(`Retrieving dependencies of ${customLabelRecords.length} custom labels...`);
        const customLabelsDependencies = await sfdcManager.dependenciesQuery(
            await OrgCheckProcessor.map(customLabelRecords, (record) => sfdcManager.caseSafeId(record.Id)), 
            logger
        );
        
        // Create the map
        logger?.log(`Parsing ${customLabelRecords.length} custom labels...`);
        const customLabels = new Map(await OrgCheckProcessor.map(customLabelRecords, (record) => {

            // Get the ID15 of this custom label
            const id = sfdcManager.caseSafeId(record.Id);

            // Create the instance
            const customLabel = labelDataFactory.createWithScore({
                properties: {
                    id: id,
                    name: record.Name,
                    package: (record.NamespacePrefix || ''),
                    category: record.Category,
                    isProtected: record.IsProtected === true,
                    language: record.Language,
                    label: record.MasterLabel,
                    value: record.Value,
                    createdDate: record.CreatedDate, 
                    lastModifiedDate: record.LastModifiedDate,
                    url: sfdcManager.setupUrl(id, OrgCheckSalesforceMetadataTypes.CUSTOM_LABEL)
                }, 
                dependencies: {
                    data: customLabelsDependencies
                }
            });

            // Add it to the map  
            return [ customLabel.id, customLabel ];
        }));

        // Return data as map
        logger?.log(`Done`);
        return customLabels;
    } 
}