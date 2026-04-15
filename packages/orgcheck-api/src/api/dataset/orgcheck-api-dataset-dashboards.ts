import { DataAliases } from 'src/api/core/data/orgcheck-api-data-aliases';
import { DataFactoryIntf } from 'src/api/core/data/orgcheck-api-datafactory';
import { Dataset } from 'src/api/core/dataset/orgcheck-api-dataset';
import { SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { Processor } from 'src/api/core/orgcheck-api-processor';
import { SalesforceMetadataTypes } from 'src/api/core/salesforce/orgcheck-api-salesforce-metadatatypes';
import { SalesforceManagerIntf } from 'src/api/core/salesforce/orgcheck-api-salesforcemanager';
import { SfdcDashboard } from 'src/api/data/orgcheck-api-data-dashboard';

export class DatasetDashboards implements Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @returns {Promise<Map<string, SfdcDashboard>>} The result of the dataset
     */
    async run(sfdcManager: SalesforceManagerIntf, dataFactory: DataFactoryIntf, logger: SimpleLoggerIntf): Promise<Map<string, SfdcDashboard>> {

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
        const dashboardDataFactory = dataFactory.getInstance(DataAliases.SfdcDashboard);

        // Create the map
        const dashboardRecords = results[0];
        logger?.log(`Parsing ${dashboardRecords?.length} dashboards...`);
        const dashboards: Map<string, SfdcDashboard> = new Map(await Processor.map(dashboardRecords, async (/** @type {any} */ record: any) => {
        
            // Get the ID15 of this dashboard
            const id = sfdcManager.caseSafeId(record.Id);

            // Create the instance
            /** @type {SfdcDashboard} */
            const dashboard: SfdcDashboard = dashboardDataFactory.createWithScore({
                properties: {
                    id: id,
                    folderName: record.FolderName, 
                    folderId: record.FolderId, 
                    name: record.Title, 
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