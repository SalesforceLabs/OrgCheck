import { DataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { Dataset } from '../core/orgcheck-api-dataset';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { Processor } from '../core/orgcheck-api-processor';
import { SalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';
import { SFDC_Package } from '../data/orgcheck-api-data-package';

export class DatasetPackages extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @returns {Promise<Map<string, SFDC_Package>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First SOQL queries
        logger?.log(`Querying Tooling API about InstalledSubscriberPackage and REST API about Organization in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            tooling: true,
            string: 'SELECT Id, SubscriberPackage.NamespacePrefix, SubscriberPackage.Name ' +
                    'FROM InstalledSubscriberPackage '
        }, {
            string: 'SELECT NamespacePrefix FROM Organization LIMIT 1 '
        }], logger);

        // Init the factory and records
        const packageDataFactory = dataFactory.getInstance(SFDC_Package);

        // Create the map
        const packageRecords = results[0];
        logger?.log(`Parsing ${packageRecords.length} installed packages...`);
        const packages = new Map(await Processor.map(packageRecords, (/** @type {any} */ record) => {

            // Get the ID15 of this custom field
            const id = sfdcManager.caseSafeId(record.Id);

            // Create the instance
            /** @type {SFDC_Package} */
            const installedPackage = packageDataFactory.create({
                properties: {
                    id: id,
                    name: record.SubscriberPackage.Name,
                    namespace: record.SubscriberPackage.NamespacePrefix,
                    type: 'Installed'
                }
            });

            // Add it to the map  
            return [ installedPackage.id, installedPackage ];
        }));

        // Add potential package of the organization if it is set up
        const organizationRecords = results[1];
        // Checking data
        if (!organizationRecords || organizationRecords.length === 0) {
            throw new Error(`DatasetPackages: No Organization record found in the org.`);
        }
        // Get the first record
        const localPackage = organizationRecords[0].NamespacePrefix;
        if (localPackage) {
            logger?.log(`Adding your local package ${localPackage}...`);
            packages.set(
                localPackage, 
                /** @type {SFDC_Package} */
                packageDataFactory.create({
                    properties: {
                        id: localPackage, 
                        name: localPackage, 
                        namespace: localPackage, 
                        type: 'Local'
                    }
                })
            );
        }

        // Return data as map
        logger?.log(`Done`);
        return packages;
    } 
}