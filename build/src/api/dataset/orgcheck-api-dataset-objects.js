import { DataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { Dataset } from '../core/orgcheck-api-dataset';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { Processor } from '../core/orgcheck-api-processor';
import { SalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';
import { SFDC_Object } from '../data/orgcheck-api-data-object';

const WHERE_CLAUSE_SOBJECTS = (prefix) => {
    return `WHERE ${prefix}KeyPrefix <> null ` +
           `AND ${prefix}DeveloperName <> null ` +
           `AND (NOT(${prefix}KeyPrefix IN ('00a', '017', '02c', '0D5', '1CE'))) `+
                // 00a	*Comment for custom objects
                // 017	*History for custom objects
                // 02c	*Share for custom objects
                // 0D5	*Feed for custom objects
                // 1CE	*Event for custom objects
           `AND (NOT(${prefix}QualifiedApiName like '%_hd'))`;
                // We want to filter out trending historical objects
}

export class DatasetObjects extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @returns {Promise<Map<string, SFDC_Object>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // Init the factory and records
        const objectDataFactory = dataFactory.getInstance(SFDC_Object);

        // Two actions to perform in parallel, global describe and an additional entity definition soql query
        logger?.log(`Performing a global describe and in parallel a SOQL query to EntityDefinition...`);            
        const results = await Promise.all([
            
            // Requesting information from the current salesforce org
            sfdcManager.describeGlobal(logger), // not using tooling api !!!

            // Some information are not in the global describe, we need to append them 
            sfdcManager.soqlQuery([{
                // Global EntityDefinition soql query
                string: 'SELECT DurableId, NamespacePrefix, DeveloperName, QualifiedApiName, ' +
                            'ExternalSharingModel, InternalSharingModel ' +
                        'FROM EntityDefinition ' +
                        WHERE_CLAUSE_SOBJECTS(''),
                tooling: true, // Using Tooling to get the Activity object
                queryMoreField: 'DurableId' // entityDef does not support calling QueryMore, use the custom instead
            }, {
                // Get the number of custom fields per object
                string: 'SELECT EntityDefinitionId, COUNT(Id) NbCustomFields ' + // EntityDefinitionId = EntityDefinition.DurableId
                        'FROM CustomField ' +
                        'GROUP BY EntityDefinitionId',
                tooling: true,
            }, {
                // Get the number of page layouts per object
                string: 'SELECT EntityDefinitionId, COUNT(Id) NbPageLayouts ' + // EntityDefinitionId = EntityDefinition.DurableId
                        'FROM Layout ' +
                        'GROUP BY EntityDefinitionId',
                tooling: true,
            }, {
                // Get the number of record types per object
                string: 'SELECT EntityDefinitionId, COUNT(Id) NbRecordTypes ' + // EntityDefinitionId = EntityDefinition.DurableId
                        'FROM RecordType ' +
                        'GROUP BY EntityDefinitionId',
                tooling: true,
            }, {
                // Get the number of workflow rules per object
                string: 'SELECT TableEnumOrId, COUNT(Id) NbWorkflowRules ' + // TableEnumOrId = EntityDefinition.QualifiedApiName
                        'FROM WorkflowRule ' +
                        'GROUP BY TableEnumOrId',
                tooling: true,
            }, {
                // Get the number of validation rules per object
                string: 'SELECT EntityDefinitionId, COUNT(Id) NbValidationRules ' + // EntityDefinitionId = EntityDefinition.DurableId
                        'FROM ValidationRule ' +
                        'GROUP BY EntityDefinitionId',
                tooling: true,
            }, {
                // Get the number of all the apex triggers per object
                string: 'SELECT EntityDefinitionId, COUNT(Id) NbTriggers ' + // EntityDefinitionId = EntityDefinition.DurableId
                        'FROM ApexTrigger ' +
                        'GROUP BY EntityDefinitionId',
                tooling: true,
            }], logger)
        ]);

        const objectsDescription = results[0]; 
        const entities = results[1][0];
        const nbCustomFieldsPerEntity = results[1][1];
        const nbPageLayoutsPerEntity = results[1][2];
        const nbRecordTypesPerEntity = results[1][3];
        const nbWorkflowRulesPerEntity = results[1][4];
        const nbValidationRulesPerEntity = results[1][5];
        const nbTriggersPerEntityStatus = results[1][6];

        const entitiesByName = {};
        const qualifiedApiNames = await Processor.map(
            entities, 
            (/** @type {any} */ record) => { 
                entitiesByName[record.QualifiedApiName] = record; 
                return record.QualifiedApiName;
            }
        );
        const nbCustomFieldsByDurableId = {};
        const nbPageLayoutsByDurableId = {};
        const nbRecordTypesByDurableId = {};
        const nbWorkflowRulesByName = {};
        const nbValidationRulesByDurableId = {};
        const nbTriggersByDurableId = {};
        await Promise.all([
            Processor.forEach(nbCustomFieldsPerEntity, (/** @type {any} */ recordCount) => nbCustomFieldsByDurableId[recordCount.EntityDefinitionId] = recordCount.NbCustomFields),
            Processor.forEach(nbPageLayoutsPerEntity, (/** @type {any} */ recordCount) => nbPageLayoutsByDurableId[recordCount.EntityDefinitionId] = recordCount.NbPageLayouts),
            Processor.forEach(nbRecordTypesPerEntity, (/** @type {any} */ recordCount) => nbRecordTypesByDurableId[recordCount.EntityDefinitionId] = recordCount.NbRecordTypes),
            Processor.forEach(nbWorkflowRulesPerEntity, (/** @type {any} */ recordCount) => nbWorkflowRulesByName[recordCount.TableEnumOrId] = recordCount.NbWorkflowRules),
            Processor.forEach(nbValidationRulesPerEntity, (/** @type {any} */ recordCount) => nbValidationRulesByDurableId[recordCount.EntityDefinitionId] = recordCount.NbValidationRules),
            Processor.forEach(nbTriggersPerEntityStatus, (/** @type {any} */ recordCount) => nbTriggersByDurableId[recordCount.EntityDefinitionId] = recordCount.NbTriggers)
        ]) 

        // Create the map
        logger?.log(`Parsing ${objectsDescription.length} objects...`);
        const objects = new Map(await Processor.map(
            objectsDescription,
            (/** @type {any} */ object) => {

                const type = sfdcManager.getObjectType(object.name, object.customSetting)
                const entity = entitiesByName[object.name];
                const durableId = entity.DurableId;

                // Create the instance
                /** @type {SFDC_Object} */
                const obj = objectDataFactory.createWithScore({
                    properties: {
                        id: object.name,
                        label: object.label,
                        name: entity.DeveloperName,
                        apiname: object.name,
                        package: (entity.NamespacePrefix || ''),
                        typeId: type,
                        externalSharingModel: entity.ExternalSharingModel,
                        internalSharingModel: entity.InternalSharingModel,
                        nbCustomFields: nbCustomFieldsByDurableId[durableId] ?? 0,
                        nbPageLayouts: nbPageLayoutsByDurableId[durableId] ?? 0,
                        nbRecordTypes: nbRecordTypesByDurableId[durableId] ?? 0,
                        nbWorkflowRules: nbWorkflowRulesByName[object.name] ?? 0,
                        nbValidationRules: nbValidationRulesByDurableId[durableId] ?? 0,
                        nbApexTriggers: nbTriggersByDurableId[durableId] ?? 0,
                        url: sfdcManager.setupUrl(durableId, type)
                    }
                });

                // Add it to the map  
                return [ obj.id, obj ];
            },
            (/** @type {any} */ object) => {
                return qualifiedApiNames?.includes(object.name) ? true : false;
            }
        ));

        // Return data as map
        logger?.log(`Done`);
        return objects;
    } 
}