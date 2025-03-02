import { DataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { Dataset } from '../core/orgcheck-api-dataset';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { Processor } from '../core/orgcheck-api-processing';
import { SalesforceMetadataTypes } from '../core/orgcheck-api-salesforce-metadatatypes';
import { SalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';
import { SFDC_Field } from '../data/orgcheck-api-data-field';

export class DatasetCustomFields extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager
     * @param {DataFactoryIntf} dataFactory
     * @param {SimpleLoggerIntf} logger
     * @param {Map} parameters
     * @returns {Promise<Map<string, SFDC_Field>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger, parameters) {

        const fullObjectApiName = parameters?.get('object');

        // First SOQL query
        logger?.log(`Querying Tooling API about CustomField in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            tooling: true,
            string: 'SELECT Id, EntityDefinition.QualifiedApiName, EntityDefinition.IsCustomSetting ' +
                    'FROM CustomField ' +
                    `WHERE ManageableState IN ('installedEditable', 'unmanaged') ` +
                    (fullObjectApiName ? `AND EntityDefinition.QualifiedApiName = '${fullObjectApiName}'` : '')
        }], logger);

        // Init the factory and records
        const fieldDataFactory = dataFactory.getInstance(SFDC_Field);
        const customFieldRecords = results[0];

        logger?.log(`Parsing ${customFieldRecords.length} custom fields...`);        
        
        const entityInfoByCustomFieldId = new Map(await Processor.map(
            customFieldRecords, 
            (record) => [ 
                sfdcManager.caseSafeId(record.Id), 
                { 
                    qualifiedApiName: record.EntityDefinition.QualifiedApiName, 
                    isCustomSetting: record.EntityDefinition.IsCustomSetting 
                }
            ],
            (record) => (record.EntityDefinition ? true : false)
        ));

        // Then retreive dependencies
        logger?.log(`Retrieving dependencies of ${customFieldRecords.length} custom fields...`);
        const customFieldsDependencies = await sfdcManager.dependenciesQuery(
            await Processor.map(customFieldRecords, (record) => sfdcManager.caseSafeId(record.Id)), 
            logger
        );

        // Get information about custom fields using metadata
        logger?.log(`Calling Tooling API Composite to get more information about these ${entityInfoByCustomFieldId.size} custom fields...`);
        const records = await sfdcManager.readMetadataAtScale('CustomField', Array.from(entityInfoByCustomFieldId.keys()), [], logger);

        // Create the map
        logger?.log(`Parsing ${records.length} custom fields...`);
        const customFields = new Map(await Processor.map(records, (record) => {

            // Get the ID15
            const id = sfdcManager.caseSafeId(record.Id);

            // Get Information about entity
            const entityInfo = entityInfoByCustomFieldId.get(id);

            // Create the instance (with score)
            const customField = fieldDataFactory.createWithScore({
                properties: {
                    id: id,
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
                    isRestrictedPicklist: record.Metadata.valueSet && record.Metadata.valueSet.restricted === true,
                    formula: record.Metadata.formula,
                    url: sfdcManager.setupUrl(id, SalesforceMetadataTypes.CUSTOM_FIELD, entityInfo.qualifiedApiName, sfdcManager.getObjectType( entityInfo.qualifiedApiName, entityInfo.isCustomSetting))
                }, 
                dependencies: {
                    data: customFieldsDependencies
                }
            });

            // Add it to the map  
            return [ customField.id, customField ];
        }));

        // Return data as map
        logger?.log(`Done`);
        return customFields;
    } 
}