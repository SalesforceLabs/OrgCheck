import { CodeScanner } from '../core/orgcheck-api-codescanner';
import { DataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { Dataset } from '../core/orgcheck-api-dataset';
import { OrgCheckGlobalParameter } from '../core/orgcheck-api-globalparameter';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { Processor } from '../core/orgcheck-api-processor';
import { SalesforceMetadataTypes } from '../core/orgcheck-api-salesforce-metadatatypes';
import { SalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';
import { SFDC_Field } from '../data/orgcheck-api-data-field';

const EXCLUDED_OBJECT_PREFIXES = [ 
    '00a', // Comment for custom objects
    '017', // History for custom objects
    '02c', // Share for custom objects
    '0D5', // Feed for custom objects
    '1CE', // Event for custom objects
];

export class DatasetCustomFields extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @param {Map<string, any>} parameters - The parameters
     * @returns {Promise<Map<string, SFDC_Field>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger, parameters) {

        const fullObjectApiName = OrgCheckGlobalParameter.getSObjectName(parameters);

        // First SOQL query
        logger?.log(`Querying Tooling API about CustomField in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            tooling: true,
            string: 'SELECT Id, EntityDefinition.QualifiedApiName, EntityDefinition.IsCustomSetting, EntityDefinition.KeyPrefix ' +
                    'FROM CustomField ' +
                    `WHERE ManageableState IN ('installedEditable', 'unmanaged') ` +
                    (fullObjectApiName === OrgCheckGlobalParameter.ALL_VALUES ? '' : `AND EntityDefinition.QualifiedApiName = '${fullObjectApiName}'`)
        }], logger);

        // Init the factory and records
        const fieldDataFactory = dataFactory.getInstance(SFDC_Field);
        const customFieldRecords = results[0];

        logger?.log(`Parsing ${customFieldRecords.length} custom fields...`);        
        
        const entityInfoByCustomFieldId = new Map(await Processor.map(
            customFieldRecords, 
            (/** @type {any} */ record) => [ 
                sfdcManager.caseSafeId(record.Id), 
                { 
                    qualifiedApiName: record.EntityDefinition.QualifiedApiName, 
                    isCustomSetting: record.EntityDefinition.IsCustomSetting 
                }
            ],
            (/** @type {any} */ record) => {
                if (!record.EntityDefinition) return false; // ignore if no EntityDefinition linked
                if (EXCLUDED_OBJECT_PREFIXES.includes(record.EntityDefinition.KeyPrefix)) return false; // ignore these objects
                if (record.EntityDefinition.QualifiedApiName?.endsWith('_hd')) return false; // ignore the trending historical objects
                return true;
            }
        ));

        // Then retreive dependencies
        logger?.log(`Retrieving dependencies of ${customFieldRecords.length} custom fields...`);
        const customFieldsDependencies = await sfdcManager.dependenciesQuery(
            await Processor.map(customFieldRecords, (/** @type {any} */ record) => sfdcManager.caseSafeId(record.Id)), 
            logger
        );

        // Get information about custom fields using metadata
        logger?.log(`Calling Tooling API Composite to get more information about these ${entityInfoByCustomFieldId.size} custom fields...`);
        const records = await sfdcManager.readMetadataAtScale(
            'CustomField', 
            Array.from(entityInfoByCustomFieldId.keys()), 
            [ 'INVALID_CROSS_REFERENCE_KEY' ], 
            logger
        );

        // Create the map
        const customFields = new Map(await Processor.map(records, (/** @type {any} */ record) => {

            // Get the ID15
            const id = sfdcManager.caseSafeId(record.Id);

            // Get Information about entity
            const entityInfo = entityInfoByCustomFieldId.get(id);

            // Create the instance
            /** @type {SFDC_Field} */
            const customField = fieldDataFactory.create({
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
                    formula: record.Metadata.formula,
                    url: sfdcManager.setupUrl(id, SalesforceMetadataTypes.CUSTOM_FIELD, entityInfo.qualifiedApiName, sfdcManager.getObjectType( entityInfo.qualifiedApiName, entityInfo.isCustomSetting))
                }, 
                dependencyData: customFieldsDependencies
            });

            if (record.Metadata.valueSet) {
                if (typeof record.Metadata.valueSet === 'string') {
                    // If valueSet is a string it refers to a global picklist and is ALWAYS restricted
                    // see https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_skills.htm
                    customField.isRestrictedPicklist = true;
                } else {
                    // see https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_field_types.htm?q=valueSetDefinition
                    customField.isRestrictedPicklist = (record.Metadata.valueSet.restricted === true);
                }
            } else {
                customField.isRestrictedPicklist = false
            }

            // Get information directly from the source code (if available)
            if (customField.formula) {
                const sourceCode = CodeScanner.RemoveCommentsFromCode(customField.formula);
                customField.hardCodedURLs = CodeScanner.FindHardCodedURLs(sourceCode);
                customField.hardCodedIDs = CodeScanner.FindHardCodedIDs(sourceCode);
            }
            
            // Compute the score of this item
            fieldDataFactory.computeScore(customField);

            // Add it to the map  
            return [ customField.id, customField ];
        }));

        // Return data as map
        logger?.log(`Done`);
        return customFields;
    } 
}