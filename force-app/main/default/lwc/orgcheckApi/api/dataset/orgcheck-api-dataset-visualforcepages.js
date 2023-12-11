import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { SFDC_VisualForcePage } from '../data/orgcheck-api-data-visualforcepage';

export class OrgCheckDatasetVisualForcePages extends OrgCheckDataset {

    run(sfdcManager, resolve, reject) {

        // SOQL query on CustomField
        sfdcManager.soqlQuery([{ 
            tooling: true,
            string: 'SELECT Id, Name, ApiVersion, NamespacePrefix, Description, IsAvailableInTouch, '+
                        'CreatedDate, LastModifiedDate '+
                    'FROM ApexPage '+
                    'WHERE ManageableState IN (\'installedEditable\', \'unmanaged\')',
            addDependenciesBasedOnField: 'Id'
        }]).then((results) => {

            // Init the map
            const visualForcePages = new Map();

            // Set the map
            results[0].records
                .forEach((record) => {

                    // Get the ID15 of this custom field
                    const id = sfdcManager.caseSafeId(record.Id);

                    // Create the instance
                    const visualForcePage = new SFDC_VisualForcePage({
                        id: id,
                        url: sfdcManager.setupUrl('visual-force-page', record.Id),
                        name: record.Name,
                        apiVersion: record.ApiVersion,
                        isMobileReady: record.IsAvailableInTouch,
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
                    if (sfdcManager.isEmpty(visualForcePage.description)) visualForcePage.setBadField('description');
                    if (visualForcePage.isItReferenced() === false) visualForcePage.setBadField('dependencies.referenced');

                    // Add it to the map  
                    visualForcePages.set(visualForcePage.id, visualForcePage);
                });

            // Return data
            resolve(visualForcePages);
        }).catch(reject);
    } 
}