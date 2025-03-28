import { DataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { Dataset } from '../core/orgcheck-api-dataset';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { SalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';
import { SFDC_ObjectType,
    OBJECTTYPE_ID_STANDARD_SOBJECT, 
    OBJECTTYPE_ID_CUSTOM_SOBJECT, 
    OBJECTTYPE_ID_CUSTOM_EXTERNAL_SOBJECT,
    OBJECTTYPE_ID_CUSTOM_SETTING, 
    OBJECTTYPE_ID_CUSTOM_METADATA_TYPE, 
    OBJECTTYPE_ID_CUSTOM_EVENT,
    OBJECTTYPE_ID_KNOWLEDGE_ARTICLE, 
    OBJECTTYPE_ID_CUSTOM_BIG_OBJECT } from '../data/orgcheck-api-data-objecttype';

/** @type {Array<{id: string, label: string}>} */ 
const OBJECTTYPES = [
    { id: OBJECTTYPE_ID_STANDARD_SOBJECT,        label: 'Standard Object' },
    { id: OBJECTTYPE_ID_CUSTOM_SOBJECT,          label: 'Custom Object' },
    { id: OBJECTTYPE_ID_CUSTOM_EXTERNAL_SOBJECT, label: 'External Object' },
    { id: OBJECTTYPE_ID_CUSTOM_SETTING,          label: 'Custom Setting' },
    { id: OBJECTTYPE_ID_CUSTOM_METADATA_TYPE,    label: 'Custom Metadata Type' },
    { id: OBJECTTYPE_ID_CUSTOM_EVENT,            label: 'Platform Event' },
    { id: OBJECTTYPE_ID_KNOWLEDGE_ARTICLE,       label: 'Knowledge Article' },
    { id: OBJECTTYPE_ID_CUSTOM_BIG_OBJECT,       label: 'Big Object' }
];

export class DatasetObjectTypes extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager
     * @param {DataFactoryIntf} dataFactory
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<Map<string, SFDC_ObjectType>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {
    
        // Init the factory and records
        const objecTypeDataFactory = dataFactory.getInstance(SFDC_ObjectType);

        // Return data
        return new Map(OBJECTTYPES.map((type) => [ type.id, objecTypeDataFactory.create({ properties: { id: type.id, label: type.label }}) ]));
    } 
}