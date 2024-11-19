import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';
import { SFDC_Package } from '../data/orgcheck-api-data-package';

export class OrgCheckDatasetPackages extends OrgCheckDataset {

    async run(sfdcManager, dataFactory, localLogger) {

        // First SOQL queries
        localLogger.log(`Querying Tooling API about InstalledSubscriberPackage and REST API about Organization in the org...`);            
        const results = await sfdcManager.soqlQuery([{ 
            tooling: true,
            string: 'SELECT Id, SubscriberPackage.NamespacePrefix, SubscriberPackage.Name '+
                    'FROM InstalledSubscriberPackage ' 
        }, { 
            string: 'SELECT NamespacePrefix FROM Organization LIMIT 1 '
        }], localLogger);

        // Init the factory and records
        const packageDataFactory = dataFactory.getInstance(SFDC_Package);

        // Create the map
        const packageRecords = results[0].records;
        localLogger.log(`Parsing ${packageRecords.length} installed packages...`);
        const packages = new Map(await OrgCheckProcessor.map(packageRecords, (record) => {

            // Get the ID15 of this custom field
            const id = sfdcManager.caseSafeId(record.Id);

            // Create the instance
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
        const localPackage = results[1].records[0].NamespacePrefix;
        if (localPackage) {
            localLogger.log(`Adding your local package ${localPackage}...`);
            packages.set(localPackage, packageDataFactory.create({
                properties: {
                    id: localPackage, 
                    name: localPackage, 
                    namespace: localPackage, 
                    type: 'Local'
                }
            }));
        }

        // Return data as map
        localLogger.log(`Done`);
        return packages;
    } 
}