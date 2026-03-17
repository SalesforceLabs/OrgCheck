import { DataAliases } from 'src/api/core/orgcheck-api-data-aliases';
import { DataFactoryIntf } from 'src/api/core/orgcheck-api-datafactory';
import { Dataset } from 'src/api/core/orgcheck-api-dataset';
import { SimpleLoggerIntf } from 'src/api/core/orgcheck-api-logger';
import { Processor } from 'src/api/core/orgcheck-api-processor';
import { SalesforceManagerIntf } from 'src/api/core/orgcheck-api-salesforcemanager';
import { SfdcPackage } from 'src/api/data/orgcheck-api-data-package';

export class DatasetPackages implements Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @returns {Promise<Map<string, SfdcPackage>>} The result of the dataset
     */
    async run(sfdcManager: SalesforceManagerIntf, dataFactory: DataFactoryIntf, logger: SimpleLoggerIntf): Promise<Map<string, SfdcPackage>> {

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
        const packageDataFactory = dataFactory.getInstance(DataAliases.SfdcPackage);

        // Create the map
        const packageRecords = results[0];
        logger?.log(`Parsing ${packageRecords?.length} installed packages...`);
        const packages: Map<string, SfdcPackage> = new Map(await Processor.map(packageRecords, (/** @type {any} */ record: any) => {

            // Get the ID15 of this custom field
            const id = sfdcManager.caseSafeId(record.Id);

            // Create the instance
            /** @type {SfdcPackage} */
            const installedPackage: SfdcPackage = packageDataFactory.create({
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
        if (!organizationRecords || organizationRecords?.length === 0) {
            throw new Error(`DatasetPackages: No Organization record found in the org.`);
        }
        // Get the first record
        const localPackage = organizationRecords[0].NamespacePrefix;
        if (localPackage) {
            logger?.log(`Adding your local package ${localPackage}...`);
            packages.set(
                localPackage, 
                /** @type {SfdcPackage} */
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