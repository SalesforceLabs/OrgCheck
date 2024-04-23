import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { SFDC_LightningAuraComponent } from '../data/orgcheck-api-data-lightningauracomponent';

export class OrgCheckDatasetLightningAuraComponents extends OrgCheckDataset {

    run(sfdcManager, dataFactory, localLogger, resolve, reject) {

        // SOQL query on CustomField
        sfdcManager.soqlQuery([{ 
            tooling: true,
            string: 'SELECT Id, MasterLabel, ApiVersion, NamespacePrefix, Description, '+
                        'CreatedDate, LastModifiedDate '+
                    'FROM AuraDefinitionBundle '+
                    'WHERE ManageableState IN (\'installedEditable\', \'unmanaged\') ',
            addDependenciesBasedOnField: 'Id'
        }]).then((results) => {

            // Init the map
            const components = new Map();

            // Init the factory
            const componentDataFactory = dataFactory.getInstance(SFDC_LightningAuraComponent);

            // Set the map
            localLogger.log(`Parsing ${results[0].records.length} Aura Definition Bundles...`);
            results[0].records
                .forEach((record) => {

                    // Get the ID15 of this custom field
                    const id = sfdcManager.caseSafeId(record.Id);

                    // Create the instance
                    const component = componentDataFactory.create({
                        id: id,
                        url: sfdcManager.setupUrl('lightning-aura-component', record.Id),
                        name: record.MasterLabel,
                        apiVersion: record.ApiVersion,
                        package: (record.NamespacePrefix || ''),
                        createdDate: record.CreatedDate,
                        lastModifiedDate: record.LastModifiedDate,
                        description: record.Description,
                        allDependencies: results[0].allDependencies
                    });

                    // Compute the score of this item
                    componentDataFactory.computeScore(component);

                    // Add it to the map  
                    components.set(component.id, component);
                });

            // Return data
            resolve(components);
        }).catch(reject);
    } 
}