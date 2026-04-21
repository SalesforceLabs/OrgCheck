import { DataAliases } from 'src/api/core/data/orgcheck-api-data-aliases';
import { DataFactoryIntf } from 'src/api/core/data/orgcheck-api-datafactory';
import { Dataset } from 'src/api/core/dataset/orgcheck-api-dataset';
import { SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { MediumProcessor } from 'src/api/core/orgcheck-api-processor';
import { SalesforceManagerIntf } from 'src/api/core/salesforce/orgcheck-api-salesforcemanager';
import { SfdcObject } from 'src/api/data/orgcheck-api-data-object';

export class DatasetObjects implements Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @returns {Promise<Map<string, SfdcObject>>} The result of the dataset
     */
    async run(sfdcManager: SalesforceManagerIntf, dataFactory: DataFactoryIntf, logger: SimpleLoggerIntf): Promise<Map<string, SfdcObject>> {

        // Init the factory and records
        const objectDataFactory = dataFactory.getInstance(DataAliases.SfdcObject);

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
                        `WHERE KeyPrefix <> null ` +
                        `AND DeveloperName <> null ` +
                        `AND (NOT(KeyPrefix IN ('00a', '017', '02c', '0D5', '1CE'))) `+
                                // 00a	*Comment for custom objects
                                // 017	*History for custom objects
                                // 02c	*Share for custom objects
                                // 0D5	*Feed for custom objects
                                // 1CE	*Event for custom objects
                        `AND (NOT(QualifiedApiName like '%_hd'))`,
                                // We want to filter out trending historical objects
                tooling: true, // Using Tooling to get the Activity object
                queryMoreField: 'DurableId' // entityDef does not support calling QueryMore, use the custom instead
            }, {
                // Get the number of custom fields per object
                string: 'SELECT EntityDefinitionId, COUNT(Id) NbCustomFields ' + // EntityDefinitionId = EntityDefinition.DurableId
                        'FROM CustomField ' +
                        'GROUP BY EntityDefinitionId',
                tooling: true,
                queryMoreField: 'CreatedDate' // entityDef does not support calling QueryMore, use the custom instead
            }, {
                // Get the number of page layouts per object
                string: 'SELECT EntityDefinitionId, COUNT(Id) NbPageLayouts ' + // EntityDefinitionId = EntityDefinition.DurableId
                        'FROM Layout ' +
                        'GROUP BY EntityDefinitionId',
                tooling: true,
                queryMoreField: 'CreatedDate' // entityDef does not support calling QueryMore, use the custom instead
            }, {
                // Get the number of record types per object
                string: 'SELECT EntityDefinitionId, COUNT(Id) NbRecordTypes ' + // EntityDefinitionId = EntityDefinition.DurableId
                        'FROM RecordType ' +
                        'GROUP BY EntityDefinitionId',
                tooling: true,
                queryMoreField: 'CreatedDate' // entityDef does not support calling QueryMore, use the custom instead
            }, {
                // Get the number of workflow rules per object
                string: 'SELECT TableEnumOrId, COUNT(Id) NbWorkflowRules ' + // TableEnumOrId = EntityDefinition.QualifiedApiName
                        'FROM WorkflowRule ' +
                        'GROUP BY TableEnumOrId',
                tooling: true,
                queryMoreField: 'CreatedDate' // entityDef does not support calling QueryMore, use the custom instead
            }, {
                // Get the number of validation rules per object
                string: 'SELECT EntityDefinitionId, COUNT(Id) NbValidationRules ' + // EntityDefinitionId = EntityDefinition.DurableId
                        'FROM ValidationRule ' +
                        'GROUP BY EntityDefinitionId',
                tooling: true,
                queryMoreField: 'CreatedDate' // entityDef does not support calling QueryMore, use the custom instead
            }, {
                // Get the number of all the apex triggers per object
                string: 'SELECT EntityDefinitionId, COUNT(Id) NbTriggers ' + // EntityDefinitionId = EntityDefinition.DurableId
                        'FROM ApexTrigger ' +
                        'GROUP BY EntityDefinitionId',
                tooling: true,
                queryMoreField: 'CreatedDate' // entityDef does not support calling QueryMore, use the custom instead
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
        const qualifiedApiNames = await MediumProcessor.map(
            entities, 
            (record: any) => { 
                entitiesByName[record.QualifiedApiName] = record; 
                return record.QualifiedApiName;
            }
        );
        const counters = new Map();
        const SetCounter = (durableId, counterName, value) => {
            const key = `${durableId}-${counterName}`;
            if (counters.has(key) === false) {
                counters.set(key, value);
            } else {
                counters.set(key, counters.get(key) + value);
            }
        }
        await Promise.all([
            MediumProcessor.forEach(nbCustomFieldsPerEntity, async (r: any) => SetCounter(r.EntityDefinitionId, 'cf', r.NbCustomFields)),
            MediumProcessor.forEach(nbPageLayoutsPerEntity, async (r: any) => SetCounter(r.EntityDefinitionId, 'pl', r.NbPageLayouts)),
            MediumProcessor.forEach(nbRecordTypesPerEntity, async (r: any) => SetCounter(r.EntityDefinitionId, 'rt', r.NbRecordTypes)),
            MediumProcessor.forEach(nbWorkflowRulesPerEntity, async (r: any) => SetCounter(r.TableEnumOrId, 'wf', r.NbWorkflowRules)),
            MediumProcessor.forEach(nbValidationRulesPerEntity, async (r: any) => SetCounter(r.EntityDefinitionId, 'vr', r.NbValidationRules)),
            MediumProcessor.forEach(nbTriggersPerEntityStatus, async (r: any) => SetCounter(r.EntityDefinitionId, 'ap', r.NbTriggers))
        ]) 

        // Create the map
        logger?.log(`Parsing ${objectsDescription?.length} objects...`);
        const objects: Map<string, SfdcObject> = new Map(await MediumProcessor.map(
            objectsDescription,
            (object: any) => {

                const type = sfdcManager.getObjectType(object.name, object.customSetting)
                const entity = entitiesByName[object.name];
                const durableId = entity.DurableId;

                // Create the instance
                const obj: SfdcObject = objectDataFactory.createWithScore({
                    properties: {
                        id: object.name,
                        label: object.label,
                        name: entity.DeveloperName,
                        apiname: object.name,
                        package: (entity.NamespacePrefix || ''),
                        typeId: type,
                        externalSharingModel: entity.ExternalSharingModel,
                        internalSharingModel: entity.InternalSharingModel,
                        nbCustomFields: counters.get(`${durableId}-cf`) ?? 0,
                        nbPageLayouts: counters.get(`${durableId}-pl`) ?? 0,
                        nbRecordTypes: counters.get(`${durableId}-rt`) ?? 0,
                        nbWorkflowRules: counters.get(`${object.name}-wf`) ?? 0,
                        nbValidationRules: counters.get(`${durableId}-vr`) ?? 0,
                        nbApexTriggers: counters.get(`${durableId}-at`) ?? 0,
                        url: sfdcManager.setupUrl(durableId, type)
                    }
                });

                // Add it to the map  
                return [ obj.id, obj ];
            },
            (object: any) => {
                return qualifiedApiNames?.includes(object.name) ? true : false;
            }
        ));

        // Return data as map
        logger?.log(`Done`);
        return objects;
    } 
}