import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { SFDC_LightningWebComponent } from '../data/orgcheck-api-data-lightningwebcomponent';

export class OrgCheckDatasetLightningWebComponents extends OrgCheckDataset {

    run(sfdcManager, dataFactory, localLogger, resolve, reject) {

        // SOQL query on CustomField
        sfdcManager.soqlQuery([{ 
            tooling: true,
            string: 'SELECT Id, MasterLabel, ApiVersion, NamespacePrefix, Description, '+ 
                        'CreatedDate, LastModifiedDate '+
                    'FROM LightningComponentBundle '+
                    'WHERE ManageableState IN (\'installedEditable\', \'unmanaged\') ',
            addDependenciesBasedOnField: 'Id'
        }]).then((results) => {

            // Init the map
            const components = new Map();

            // Init the factory
            const componentDataFactory = dataFactory.getInstance(SFDC_LightningWebComponent);

            // Set the map
            localLogger.log(`Parsing ${results[0].records.length} Lightning Component Bundles...`);
            results[0].records
                .forEach((record) => {

                    // Get the ID15 of this custom field
                    const id = sfdcManager.caseSafeId(record.Id);

                    // Create the instance
                    const component = componentDataFactory.create({
                        id: id,
                        url: sfdcManager.setupUrl('lightning-web-component', record.Id),
                        name: record.MasterLabel,
                        apiVersion: record.ApiVersion,
                        package: record.NamespacePrefix,
                        createdDate: record.CreatedDate,
                        lastModifiedDate: record.LastModifiedDate,
                        description: record.Description,
                        allDependencies: results[0].allDependencies
                    });

                    // Compute the score of this item
                    componentDataFactory.computeScore(component);
                    /*
                    if (sfdcManager.isEmpty(component.description)) component.setBadField('description');
                    if (component.isItReferenced() === false) component.setBadField('dependencies.referenced');
                    */

                    // Add it to the map  
                    components.set(component.id, component);
                });

            // Return data
            resolve(components);
        }).catch(reject);
    } 
}