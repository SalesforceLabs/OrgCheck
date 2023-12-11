import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { SFDC_CustomLabel } from '../data/orgcheck-api-data-customlabel';

export class OrgCheckDatasetCustomLabels extends OrgCheckDataset {

    run(sfdcManager, resolve, reject) {

        // SOQL queries on ExternalString
        sfdcManager.soqlQuery([{ 
            tooling: true,
            string: 'SELECT Id, Name, NamespacePrefix, Category, IsProtected, Language, MasterLabel, Value, '+
                        'CreatedDate, LastModifiedDate '+
                    'FROM ExternalString '+
                    'WHERE ManageableState IN (\'installedEditable\', \'unmanaged\') ',
            addDependenciesBasedOnField: 'Id'
        }]).then((results) => {

            // Init the map
            const customLabels = new Map();

            // Set the map
            results[0].records
                .forEach((record) => {

                    // Get the ID15 of this custom label
                    const id = sfdcManager.caseSafeId(record.Id);

                    // Create the instance
                    const customLabel = new SFDC_CustomLabel({
                        id: id,
                        url: sfdcManager.setupUrl('custom-label', record.Id),
                        name: record.Name,
                        package: (record.NamespacePrefix || ''),
                        category: record.Category,
                        isProtected: record.IsProtected === true,
                        language: record.Language,
                        label: record.MasterLabel,
                        value: record.Value,
                        createdDate: record.CreatedDate, 
                        lastModifiedDate: record.LastModifiedDate,
                        isScoreNeeded: true,
                        isDependenciesNeeded: true,
                        dependenciesFor: 'id',
                        allDependencies: results[0].allDependencies
                    });

                    // Compute the score of this user, with the following rule:
                    //  - If the field is not used by any other entity (based on the Dependency API), then you get +1.
                    if (customLabel.isItReferenced() === false) customLabel.setBadField('dependencies.referenced');
                    // Add it to the map  
                    customLabels.set(customLabel.id, customLabel);
                });

            // Return data
            resolve(customLabels);
        }).catch(reject);
    } 
}