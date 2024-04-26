import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { SFDC_Field } from '../data/orgcheck-api-data-field';

export class OrgCheckDatasetCustomFields extends OrgCheckDataset {

    run(sfdcManager, dataFactory, localLogger, resolve, reject) {

        // List all ids for Flows and Process Builders
        // (only ids because metadata can't be read via SOQL in bulk!
        sfdcManager.soqlQuery([{ 
            tooling: true,
            string: 'SELECT Id, EntityDefinition.QualifiedApiName, EntityDefinition.IsCustomSetting '+
                    'FROM CustomField '+
                    'WHERE ManageableState IN (\'installedEditable\', \'unmanaged\')',
            addDependenciesBasedOnField: 'Id'
        }]).then((results) => {
            
            // List of custom field ids
            localLogger.log(`Parsing ${results[0].records.length} Custom Fields...`);
            const entityInfoByCustomFieldId = new Map();
            results[0].records
                .filter((record) => (record.EntityDefinition ? true : false))
                .forEach((record) => {
                    entityInfoByCustomFieldId.set(sfdcManager.caseSafeId(record.Id), { 
                        qualifiedApiName: record.EntityDefinition.QualifiedApiName, 
                        isCustomSetting: record.EntityDefinition.IsCustomSetting 
                    });
                });
            const allDependencies = results[0].allDependencies;

            // Init the map
            const customFields = new Map();

            // Init the factory
            const fieldDataFactory = dataFactory.getInstance(SFDC_Field);

            // Get information about custom fields using metadata
            sfdcManager.readMetadataAtScale('CustomField', Array.from(entityInfoByCustomFieldId.keys()))
                .then((records) => {
                    localLogger.log(`Parsing ${records.length} Custom Fields...`);
                    records.forEach((record)=> {

                        // Get the ID15 of this user
                        const id = sfdcManager.caseSafeId(record.Id);

                        // Get Information about entity
                        const entityInfo = entityInfoByCustomFieldId.get(id);

                        // Create the instance (with score)
                        const customField = fieldDataFactory.createWithScore({
                            id: id,
                            url: sfdcManager.setupUrl('field', id, entityInfo.qualifiedApiName, 
                                        sfdcManager.getObjectType( entityInfo.qualifiedApiName, entityInfo.isCustomSetting)),
                            name: record.DeveloperName,
                            label: record.Metadata.Label,
                            package: (record.NamespacePrefix || ''),
                            description: record.Description,
                            isCustom: true,
                            createdDate: record.CreatedDate,
                            lastModifiedDate: record.LastModifiedDate,
                            objectId: entityInfo.qualifiedApiName,
                            tooltip: record.InlineHelpText,
                            type: record.Metadata.type,
                            length: record.Metadata.length,
                            isUnique: record.Metadata.unique === true,
                            isEncrypted: record.Metadata.encryptionScheme !== null && record.Metadata.encryptionScheme !== 'None',
                            isExternalId: record.Metadata.externalId === true,
                            isIndexed: record.Metadata.unique === true || record.Metadata.externalId === true,
                            defaultValue: record.Metadata.defaultValue,
                            formula: record.Metadata.formula,
                            allDependencies: allDependencies
                        });

                        // Add it to the map  
                        customFields.set(customField.id, customField);
                    });

                    // Return data
                    resolve(customFields);

                }).catch(reject);
        }).catch(reject);
    } 
}