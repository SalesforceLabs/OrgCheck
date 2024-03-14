import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { SFDC_Package } from '../data/orgcheck-api-data-package';

export class OrgCheckDatasetPackages extends OrgCheckDataset {

    run(sfdcManager, localLogger, resolve, reject) {

        // SOQL queries on InstalledSubscriberPackage and Organization
        sfdcManager.soqlQuery([{ 
            tooling: true,
            string: 'SELECT Id, SubscriberPackage.NamespacePrefix, SubscriberPackage.Name '+
                    'FROM InstalledSubscriberPackage ' 
        }, { 
            string: 'SELECT NamespacePrefix FROM Organization '
        }]).then((results) => {

            // Init the map
            const packages = new Map();

            // Set the map (1/2) - installed package
            localLogger.log(`Parsing ${results[0].records.length} Installed Subscriber Packages...`);
            results[0].records.forEach((record) => {
                packages.set(record.Id, new SFDC_Package({
                    id: record.Id,
                    name: record.SubscriberPackage.Name,
                    namespace: record.SubscriberPackage.NamespacePrefix,
                    type: 'Installed'
                }));
            });

            // Set the map (2/2) - local package
            localLogger.log(`Parsing ${results[1].records.length} local packages...`);
            results[1].records.forEach((record) => {
                packages.set('<local>', new SFDC_Package({
                    id: record.NamespacePrefix, 
                    name: record.NamespacePrefix, 
                    namespace: record.NamespacePrefix, 
                    type: 'Local'
                }));
            });

            // Return data
            resolve(packages);
        }).catch(reject);        
    } 
}