import { DataAliases } from 'src/api/core/data/orgcheck-api-data-aliases';
import { DataFactoryIntf } from 'src/api/core/data/orgcheck-api-datafactory';
import { Dataset } from 'src/api/core/dataset/orgcheck-api-dataset';
import { SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { Processor } from 'src/api/core/orgcheck-api-processor';
import { SalesforceManagerIntf } from 'src/api/core/salesforce/orgcheck-api-salesforcemanager';
import { SfdcApplication } from 'src/api/data/orgcheck-api-data-application';

export class DatasetApplications implements Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @returns {Promise<Map<string, SfdcApplication>>} The result of the dataset
     */
    async run(sfdcManager: SalesforceManagerIntf, dataFactory: DataFactoryIntf, logger: SimpleLoggerIntf): Promise<Map<string, SfdcApplication>> {

        // First SOQL query
        logger?.log(`Querying REST API about Applications (tab set typed) in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            string: 'SELECT ApplicationId, Name, Label, NamespacePrefix '+
                    'FROM AppMenuItem ' +
                    'WHERE Type = \'TabSet\' '
        }], logger);

        // Init the factory and records
        const applicationDataFactory = dataFactory.getInstance(DataAliases.SfdcApplication);
        const applicationRecords = results[0];

        // Create the map
        logger?.log(`Parsing ${applicationRecords?.length} applications...`);
        const applications: Map<string, SfdcApplication> = new Map(await Processor.map(applicationRecords, (/** @type {any} */ record: any) => {

            // Get the ID15 of this application
            const id = sfdcManager.caseSafeId(record.ApplicationId);

            // Create the instance
            /** @type {SfdcApplication} */
            const application: SfdcApplication = applicationDataFactory.create({
                properties: {
                    id: id,
                    name: record.Name, 
                    label: record.Label, 
                    package: (record.NamespacePrefix || '')
                }
            });

            // Add the app in map
            return [ id, application ];
        }));

        // Return data as map
        logger?.log(`Done`);
        return applications;
    }
}