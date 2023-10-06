import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { OrgCheckMap } from '../core/orgcheck-api-type-map';
import { SFDC_LightningPage } from '../data/orgcheck-api-data-lightningpage';

export class OrgCheckDatasetLightningPages extends OrgCheckDataset {

    run(sfdcManager, resolve, reject) {

        // SOQL query on CustomField
        sfdcManager.soqlQuery([{ 
            tooling: true,
            string: 'SELECT Id, MasterLabel, EntityDefinition.DeveloperName, '+
                        'Type, NamespacePrefix, Description, ' +
                        'CreatedDate, LastModifiedDate '+
                    'FROM FlexiPage '+
                    'WHERE ManageableState IN (\'installedEditable\', \'unmanaged\') ',
            addDependenciesBasedOnField: 'Id'
        }]).then((results) => {

            // Init the map
            const pages = new OrgCheckMap();

            // Set the map
            results[0].records
                .forEach((record) => {

                    // Get the ID15 of this custom field
                    const id = sfdcManager.caseSafeId(record.Id);

                    // Create the SFDC_CustomField instance
                    const page = new SFDC_LightningPage({
                        id: id,
                        url: sfdcManager.setupUrl('lightning-page', record.Id),
                        name: record.MasterLabel,
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
                    if (sfdcManager.isEmpty(page.description)) page.setBadField('description');
                    if (page.isItReferenced() === false) page.setBadField('dependencies.referenced');

                    // Add it to the map  
                    pages.set(page.id, page);
                });

            // Return data
            resolve(pages);
        }).catch(reject);
    } 
}