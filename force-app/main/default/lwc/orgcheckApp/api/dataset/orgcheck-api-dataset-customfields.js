import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { SFDC_Field } from '../data/orgcheck-api-data-field';

export class OrgCheckDatasetCustomFields extends OrgCheckDataset {

    run(sfdcManager, dataFactory, localLogger, resolve, reject) {

        // SOQL query on CustomField
        sfdcManager.soqlQuery([{ 
            tooling: true,
            string: 'SELECT Id, EntityDefinition.QualifiedApiName, EntityDefinition.IsCustomSetting, ' +
                        'DeveloperName, NamespacePrefix, Description, CreatedDate, LastModifiedDate '+
                    'FROM CustomField '+
                    'WHERE ManageableState IN (\'installedEditable\', \'unmanaged\')',
            addDependenciesBasedOnField: 'Id'
        }]).then((results) => {

            // Init the map
            const customFields = new Map();

            // Init the factory
            const fieldDataFactory = dataFactory.getInstance(SFDC_Field);

            // Set the map
            localLogger.log(`Parsing ${results[0].records.length} Custom Fields...`);
            results[0].records
                .filter((record) => (record.EntityDefinition ? true : false))
                .forEach((record) => {

                    // Get the ID15 of this custom field
                    const id = sfdcManager.caseSafeId(record.Id);

                    // Create the instance
                    const customField = fieldDataFactory.create({
                        id: id,
                        url: sfdcManager.setupUrl('field', record.Id, record.EntityDefinition.QualifiedApiName, 
                                    sfdcManager.getObjectType(record.EntityDefinition.QualifiedApiName, record.EntityDefinition.IsCustomSetting)),
                        name: record.DeveloperName,
                        label: record.DeveloperName,
                        package: (record.NamespacePrefix || ''),
                        description: record.Description,
                        isCustom: true,
                        createdDate: record.CreatedDate,
                        lastModifiedDate: record.LastModifiedDate,
                        objectId: record.EntityDefinition.QualifiedApiName, // id but no ids!
                        allDependencies: results[0].allDependencies
                    });

                    // Compute the score of this item
                    fieldDataFactory.computeScore(customField);

                    // Add it to the map  
                    customFields.set(customField.id, customField);
                });

            // Return data
            resolve(customFields);
        }).catch(reject);
    } 
}