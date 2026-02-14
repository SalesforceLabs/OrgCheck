import { DataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { Dataset } from '../core/orgcheck-api-dataset';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { Processor } from '../core/orgcheck-api-processor';
import { SalesforceMetadataTypes } from '../core/orgcheck-api-salesforce-metadatatypes';
import { SalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';
import { SFDC_Report } from '../data/orgcheck-api-data-report';

export class DatasetReports implements Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @returns {Promise<Map<string, SFDC_Report>>} The result of the dataset
     */
    async run(sfdcManager: SalesforceManagerIntf, dataFactory: DataFactoryIntf, logger: SimpleLoggerIntf): Promise<Map<string, SFDC_Report>> {

        // First SOQL queries
        logger?.log(`Querying REST API about reports in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            string: 'SELECT Id, Description, DeveloperName, FolderName, Format, Name, ' +
                        'NamespacePrefix, CreatedDate, LastModifiedDate, LastRunDate, ' +
                        'LastViewedDate, LastReferencedDate ' +
                    'FROM Report '
        }], logger);

        // Init the factory and records
        const reportDataFactory = dataFactory.getInstance(SFDC_Report);

        // Create the map
        const reportRecords = results[0];
        logger?.log(`Parsing ${reportRecords?.length} reports...`);
        const reports: Map<string, SFDC_Report> = new Map(await Processor.map(reportRecords, async (/** @type {any} */ record: any) => {
        
            // Get the ID15 of this report
            const id = sfdcManager.caseSafeId(record.Id);

            // Create the instance
            /** @type {SFDC_Report} */
            const report: SFDC_Report = reportDataFactory.createWithScore({
                properties: {
                    id: id,
                    name: record.Name,
                    developerName: record.DeveloperName,
                    description: record.Description,
                    format: record.Format,
                    folderName: record.FolderName,
                    package: (record.NamespacePrefix || ''),
                    createdDate: record.CreatedDate,
                    lastModifiedDate: record.LastModifiedDate,
                    lastRunDate: record.LastRunDate,
                    lastViewedDate: record.LastViewedDate,
                    lastReferencedDate: record.LastReferencedDate,
                    url: sfdcManager.setupUrl(id, SalesforceMetadataTypes.REPORT)
                }
            });

            // Add it to the map  
            return [ report.id, report ];
        }));

        // Return data as map
        logger?.log(`Done`);
        return reports;
    } 
}