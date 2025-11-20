import { DataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { Dataset } from '../core/orgcheck-api-dataset';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { Processor } from '../core/orgcheck-api-processor';
import { SalesforceMetadataTypes } from '../core/orgcheck-api-salesforce-metadatatypes';
import { SalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';
import { SFDC_Dashboard } from '../data/orgcheck-api-data-dashboard';

export class DatasetDashboards extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @returns {Promise<Map<string, SFDC_Dashboard>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First SOQL queries
        logger?.log(`Querying REST API about dashboards in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            string: 'SELECT Id, FolderName, FolderId, Title, DeveloperName, NamespacePrefix, ' +
                        'Description, CreatedDate, LastModifiedDate, ' +
                        'Type, LastViewedDate, LastReferencedDate, ' +
                        'DashboardResultRefreshedDate ' +
                    'FROM Dashboard '
        }], logger);

        // Init the factory and records
        const dashboardDataFactory = dataFactory.getInstance(SFDC_Dashboard);

        // Create the map
        const dashboardRecords = results[0];
        logger?.log(`Parsing ${dashboardRecords.length} dashboards...`);
        const dashboards = new Map(await Processor.map(dashboardRecords, async (/** @type {any} */ record) => {
        
            // Get the ID15 of this dashboard
            const id = sfdcManager.caseSafeId(record.Id);

            // Create the instance
            /** @type {SFDC_Dashboard} */
            const dashboard = dashboardDataFactory.createWithScore({
                properties: {
                    id: id,
                    folderName: record.FolderName, 
                    folderId: record.FolderId, 
                    title: record.Title, 
                    developerName: record.DeveloperName, 
                    package: (record.NamespacePrefix || ''),
                    description: record.Description, 
                    createdDate: record.CreatedDate, 
                    lastModifiedDate: record.LastModifiedDate, 
                    type: record.Type, 
                    lastViewedDate: record.LastViewedDate,
                    lastReferencedDate: record.LastReferencedDate,
                    resultRefreshedDate: record.DashboardResultRefreshedDate,
                    url: sfdcManager.setupUrl(id, SalesforceMetadataTypes.DASHBOARD)
                }
            });

            // Add it to the map  
            return [ dashboard.id, dashboard ];
        }));

        // Return data as map
        logger?.log(`Done`);
        return dashboards;
    } 
}