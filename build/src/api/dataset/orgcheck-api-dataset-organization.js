import { DataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { Dataset } from '../core/orgcheck-api-dataset';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { SalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';
import { SFDC_Organization } from '../data/orgcheck-api-data-organization';

const ORGTYPE_PROD = 'Production';
const ORGTYPE_DE = 'Developer Edition';
const ORGTYPE_SANDBOX = 'Sandbox';
const ORGTYPE_TRIAL = 'Trial';

export class DatasetOrganization extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager
     * @param {DataFactoryIntf} dataFactory
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<SFDC_Organization>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First SOQL query
        logger?.log(`Querying REST API about Organization in the org...`); 
        const results = await sfdcManager.soqlQuery([{
            string: 'SELECT Id, Name, IsSandbox, OrganizationType, TrialExpirationDate, ' +
                        'NamespacePrefix ' + 
                    'FROM Organization ' +
                    'LIMIT 1'
        }], logger);
        logger?.log(`Received result=${JSON.stringify(results)}`);
        logger?.log(`We need to get the first result and from there the first record...`);
        const record = results[0][0];
        logger?.log(`Parsing the result...`);

        // Init the factory and records
        const organizationDataFactory = dataFactory.getInstance(SFDC_Organization);

        // Set the type
        let type;
        if (record.OrganizationType === 'Developer Edition') type = ORGTYPE_DE;
        else if (record.IsSandbox === true) type = ORGTYPE_SANDBOX;
        else if (record.IsSandbox === false && record.TrialExpirationDate) type = ORGTYPE_TRIAL;
        else type = ORGTYPE_PROD;

        // Create the data
        const organization = organizationDataFactory.create({
            properties: {
                id: sfdcManager.caseSafeId(record.Id),
                name: record.Name,
                type: type,
                isDeveloperEdition: (type === ORGTYPE_DE),
                isSandbox: (type === ORGTYPE_SANDBOX),
                isTrial: (type === ORGTYPE_TRIAL),
                isProduction: (type === ORGTYPE_PROD),
                localNamespace: (record.NamespacePrefix || '')
            }
        });

        // Return data as map
        logger?.log(`Done`);
        return organization;
    } 
}