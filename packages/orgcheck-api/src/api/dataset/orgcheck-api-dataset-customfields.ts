import { CodeScanner } from 'src/api/core/orgcheck-api-codescanner';
import { DataAliases } from 'src/api/core/data/orgcheck-api-data-aliases';
import { DataFactoryIntf } from 'src/api/core/data/orgcheck-api-datafactory';
import { Dataset } from 'src/api/core/dataset/orgcheck-api-dataset';
import { OrgCheckGlobalParameter } from 'src/api/core/orgcheck-api-globalparameter';
import { SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { MediumProcessor } from 'src/api/core/orgcheck-api-processor';
import { SalesforceMetadataTypes } from 'src/api/core/salesforce/orgcheck-api-salesforce-metadatatypes';
import { SalesforceManagerIntf } from 'src/api/core/salesforce/orgcheck-api-salesforcemanager';
import { SfdcField } from 'src/api/data/orgcheck-api-data-field';

const EXCLUDED_OBJECT_PREFIXES = [ 
    '00a', // Comment for custom objects
    '017', // History for custom objects
    '02c', // Share for custom objects
    '0D5', // Feed for custom objects
    '1CE', // Event for custom objects
];

export class DatasetCustomFields implements Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @param {Map<string, any>} parameters - The parameters
     * @returns {Promise<Map<string, SfdcField>>} The result of the dataset
     */
    async run(sfdcManager: SalesforceManagerIntf, dataFactory: DataFactoryIntf, logger: SimpleLoggerIntf, parameters: Map<string, unknown>): Promise<Map<string, SfdcField>> {

        const fullObjectApiName = OrgCheckGlobalParameter.getSObjectName(parameters as unknown as Map<string, string>);

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
        const fieldDataFactory = dataFactory.getInstance(DataAliases.SfdcField);
        const customFieldRecords = results[0];

        logger?.log(`Parsing ${customFieldRecords?.length} custom fields...`);        
        
        const entityInfoByCustomFieldId: Map<string, { qualifiedApiName: string; isCustomSetting: boolean }> = new Map(await MediumProcessor.map(
            customFieldRecords, 
            (record) => [ 
                sfdcManager.caseSafeId(record.Id as string), 
                { 
                    qualifiedApiName: (record.EntityDefinition as Record<string, unknown>).QualifiedApiName as string, 
                    isCustomSetting: (record.EntityDefinition as Record<string, unknown>).IsCustomSetting as boolean
                }
            ],
            (record) => {
                if (!record.EntityDefinition) return false; // ignore if no EntityDefinition linked
                if (EXCLUDED_OBJECT_PREFIXES.includes((record.EntityDefinition as Record<string, unknown>).KeyPrefix as string)) return false; // ignore these objects
                if (((record.EntityDefinition as Record<string, unknown>).QualifiedApiName as string | undefined)?.endsWith('_hd')) return false; // ignore the trending historical objects
                return true;
            }
        ));

        // Then retreive dependencies
        logger?.log(`Retrieving dependencies of ${customFieldRecords?.length} custom fields...`);
        const customFieldsDependencies = await sfdcManager.dependenciesQuery(
            await MediumProcessor.map(customFieldRecords, (record) => sfdcManager.caseSafeId(record.Id as string)), 
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
        const customFields: Map<string, SfdcField> = new Map(await MediumProcessor.map(records, (record) => {

            // Get the ID15
            const id = sfdcManager.caseSafeId(record.Id as string);

            // Get Information about entity
            const entityInfo = entityInfoByCustomFieldId.get(id);

            // Create the instance
            const metadata = record.Metadata as Record<string, unknown>;
            const customField: SfdcField = fieldDataFactory.create({
                properties: {
                    id: id,
                    name: record.DeveloperName,
                    label: metadata.label,
                    package: (record.NamespacePrefix || ''),
                    description: record.Description,
                    isCustom: true,
                    createdDate: record.CreatedDate,
                    lastModifiedDate: record.LastModifiedDate,
                    objectId: entityInfo!.qualifiedApiName,
                    tooltip: record.InlineHelpText,
                    type: metadata.type,
                    length: metadata?.length,
                    isUnique: metadata.unique === true,
                    isEncrypted: metadata.encryptionScheme !== null && metadata.encryptionScheme !== 'None',
                    isExternalId: metadata.externalId === true,
                    isIndexed: metadata.unique === true || metadata.externalId === true,
                    defaultValue: metadata.defaultValue,
                    formula: metadata.formula,
                    url: sfdcManager.setupUrl(id, SalesforceMetadataTypes.CUSTOM_FIELD, entityInfo!.qualifiedApiName, sfdcManager.getObjectType( entityInfo!.qualifiedApiName, entityInfo!.isCustomSetting))
                }, 
                dependencyData: customFieldsDependencies
            });

            if (metadata.valueSet) {
                if (typeof metadata.valueSet === 'string') {
                    // If valueSet is a string it refers to a global picklist and is ALWAYS restricted
                    // see https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_skills.htm
                    customField.isRestrictedPicklist = true;
                } else {
                    // see https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_field_types.htm?q=valueSetDefinition
                    customField.isRestrictedPicklist = ((metadata.valueSet as Record<string, unknown>).restricted === true);
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
        logger?.log(`Done.`);
        return customFields;
    } 
}