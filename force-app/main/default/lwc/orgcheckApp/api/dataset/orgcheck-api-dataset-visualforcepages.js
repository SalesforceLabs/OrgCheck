import { OrgCheckDataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { OrgCheckSimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';
import { OrgCheckSalesforceMetadataTypes } from '../core/orgcheck-api-salesforce-metadatatypes';
import { OrgCheckSalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';
import { SFDC_VisualForcePage } from '../data/orgcheck-api-data-visualforcepage';

export class OrgCheckDatasetVisualForcePages extends OrgCheckDataset {

    /**
     * @description Run the dataset and return the result
     * @param {OrgCheckSalesforceManagerIntf} sfdcManager
     * @param {OrgCheckDataFactoryIntf} dataFactory
     * @param {OrgCheckSimpleLoggerIntf} logger
     * @returns {Promise<Map<string, SFDC_VisualForcePage>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First SOQL query
        logger?.log(`Querying Tooling API about ApexPage in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            tooling: true,
            string: 'SELECT Id, Name, ApiVersion, NamespacePrefix, Description, IsAvailableInTouch, ' +
                        'CreatedDate, LastModifiedDate ' +
                    'FROM ApexPage ' +
                    'WHERE ManageableState IN (\'installedEditable\', \'unmanaged\')'
        }], logger);

        // Init the factory and records
        const pageDataFactory = dataFactory.getInstance(SFDC_VisualForcePage);
        const pageRecords = results[0].records;

        // Then retreive dependencies
        logger?.log(`Retrieving dependencies of ${pageRecords.length} visualforce pages...`);
        const pagesDependencies = await sfdcManager.dependenciesQuery(
            await OrgCheckProcessor.map(pageRecords, (record) => sfdcManager.caseSafeId(record.Id)), 
            logger
        );

        // Create the map
        logger?.log(`Parsing ${pageRecords.length} visualforce pages...`);
        const pages = new Map(await OrgCheckProcessor.map(pageRecords, (record) => {

            // Get the ID15
            const id = sfdcManager.caseSafeId(record.Id);

            // Create the instance
            const page = pageDataFactory.createWithScore({
                properties: {
                    id: id,
                    name: record.Name,
                    apiVersion: record.ApiVersion,
                    isMobileReady: record.IsAvailableInTouch,
                    package: (record.NamespacePrefix || ''),
                    createdDate: record.CreatedDate,
                    lastModifiedDate: record.LastModifiedDate,
                    description: record.Description,
                    url: sfdcManager.setupUrl(id, OrgCheckSalesforceMetadataTypes.VISUAL_FORCE_PAGE)
                }, 
                dependencies: {
                    data: pagesDependencies
                }
            });

            // Add it to the map  
            return [ page.id, page ];
        }));

        // Return data as map
        logger?.log(`Done`);
        return pages;
    } 
}