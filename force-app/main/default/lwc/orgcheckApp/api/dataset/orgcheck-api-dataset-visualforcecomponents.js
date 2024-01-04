import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { SFDC_VisualForceComponent } from '../data/orgcheck-api-data-visualforcecomponent';

export class OrgCheckDatasetVisualForceComponents extends OrgCheckDataset {
    
    run(sfdcManager, resolve, reject) {

        // SOQL query on CustomField
        sfdcManager.soqlQuery([{ 
            tooling: true,
            string: 'SELECT Id, Name, ApiVersion, NamespacePrefix, Description, '+
                        'CreatedDate, LastModifiedDate '+
                    'FROM ApexComponent '+
                    'WHERE ManageableState IN (\'installedEditable\', \'unmanaged\') ',
            addDependenciesBasedOnField: 'Id'
        }]).then((results) => {

            // Init the map
            const components = new Map();

            // Set the map
            results[0].records
                .forEach((record) => {

                    // Get the ID15 of this custom field
                    const id = sfdcManager.caseSafeId(record.Id);

                    // Create the instance
                    const component = new SFDC_VisualForceComponent({
                        id: id,
                        url: sfdcManager.setupUrl('visual-force-component', record.Id),
                        name: record.Name,
                        apiVersion: record.ApiVersion,
                        package: record.NamespacePrefix,
                        createdDate: record.CreatedDate,
                        lastModifiedDate: record.LastModifiedDate,
                        description: record.Description,
                        isScoreNeeded: true,
                        isDependenciesNeeded: true,
                        dependenciesFor: 'id',
                        allDependencies: results[0].allDependencies
                    });

                    // Compute the score of this user, with the following rule:
                    //  - If the field has no description, then you get +1.
                    //  - If the field is not used by any other entity (based on the Dependency API), then you get +1.
                    if (sfdcManager.isEmpty(component.description)) component.setBadField('description');
                    if (component.isItReferenced() === false) component.setBadField('dependencies.referenced');

                    // Add it to the map  
                    components.set(component.id, component);
                });

            // Return data
            resolve(components);
        }).catch(reject);
    } 
}