import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';
import { SFDC_Field } from '../data/orgcheck-api-data-field';

export class OrgCheckDatasetCustomFields extends OrgCheckDataset {

    async run(sfdcManager, dataFactory, localLogger, parameters) {

        const fullObjectApiName = parameters?.get('object');

        // First SOQL query
        localLogger.log(`Querying Tooling API about CustomField in the org...`);            
        const results = await sfdcManager.soqlQuery([{ 
            tooling: true,
            string: 'SELECT Id, EntityDefinition.QualifiedApiName, EntityDefinition.IsCustomSetting '+
                    'FROM CustomField '+
                    'WHERE ManageableState IN (\'installedEditable\', \'unmanaged\') '+
                    (fullObjectApiName ? `AND EntityDefinition.QualifiedApiName = '${fullObjectApiName}'` : '')
        }], localLogger);

        // Init the factory and records
        const fieldDataFactory = dataFactory.getInstance(SFDC_Field);
        const customFieldRecords = results[0].records;

        localLogger.log(`Parsing ${customFieldRecords.length} custom fields...`);        
        
        const entityInfoByCustomFieldId = new Map(await OrgCheckProcessor.carte(
            await OrgCheckProcessor.filtre(customFieldRecords, (record)=> (record.EntityDefinition ? true : false)),
            (record) => [ 
                sfdcManager.caseSafeId(record.Id), 
                { 
                    qualifiedApiName: record.EntityDefinition.QualifiedApiName, 
                    isCustomSetting: record.EntityDefinition.IsCustomSetting 
                }
            ]
        ));

        // Then retreive dependencies
        localLogger.log(`Retrieving dependencies of ${customFieldRecords.length} custom fields...`);
        const dependencies = await sfdcManager.dependenciesQuery(
            await OrgCheckProcessor.carte(customFieldRecords, (record) => sfdcManager.caseSafeId(record.Id)), 
            localLogger
        );

        // Get information about custom fields using metadata
        localLogger.log(`Calling Tooling API Composite to get more information about these ${entityInfoByCustomFieldId.size} custom fields...`);
        const records = await sfdcManager.readMetadataAtScale('CustomField', Array.from(entityInfoByCustomFieldId.keys()), localLogger);

        // Create the map
        localLogger.log(`Parsing ${records.length} custom fields...`);
        const customFields = new Map(await OrgCheckProcessor.carte(records, (record) => {

            // Get the ID15
            const id = sfdcManager.caseSafeId(record.Id);

            // Get Information about entity
            const entityInfo = entityInfoByCustomFieldId.get(id);

            // Create the instance (with score)
            const customField = fieldDataFactory.createWithScore({
                id: id,
                url: sfdcManager.setupUrl('field', id, entityInfo.qualifiedApiName, 
                            sfdcManager.getObjectType( entityInfo.qualifiedApiName, entityInfo.isCustomSetting)),
                name: record.DeveloperName,
                label: record.Metadata.label,
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
                allDependencies: dependencies
            });

            // Add it to the map  
            return [ customField.id, customField ];
        }));

        // Return data as map
        localLogger.log(`Done`);
        return customFields;
    } 
}