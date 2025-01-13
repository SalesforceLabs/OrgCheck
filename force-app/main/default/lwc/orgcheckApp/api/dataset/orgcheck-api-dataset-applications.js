import { OrgCheckDataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { OrgCheckSimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';
import { OrgCheckSalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';
import { SFDC_Application } from '../data/orgcheck-api-data-application';

export class OrgCheckDatasetApplications extends OrgCheckDataset {

    /**
     * @description Run the dataset and return the result
     * @param {OrgCheckSalesforceManagerIntf} sfdcManager
     * @param {OrgCheckDataFactoryIntf} dataFactory
     * @param {OrgCheckSimpleLoggerIntf} logger
     * @returns {Promise<Map<string, SFDC_Application>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First SOQL query
        logger?.log(`Querying REST API about Applications (tab set typed) in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            string: 'SELECT ApplicationId, Name, Label, NamespacePrefix '+
                    'FROM AppMenuItem ' +
                    'WHERE Type = \'TabSet\' '
        }], logger);

        // Init the factory and records
        const applicationDataFactory = dataFactory.getInstance(SFDC_Application);
        const applicationRecords = results[0];

        // Create the map
        logger?.log(`Parsing ${applicationRecords.length} applications...`);
        const applications = new Map(await OrgCheckProcessor.map(applicationRecords, (record) => {

            // Get the ID15 of this application
            const id = sfdcManager.caseSafeId(record.ApplicationId);

            // Create the instance
            const application = applicationDataFactory.create({
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