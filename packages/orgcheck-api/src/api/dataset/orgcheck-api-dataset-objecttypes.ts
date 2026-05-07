import { DataAliases } from 'src/api/core/data/orgcheck-api-data-aliases';
import { DataFactoryIntf } from 'src/api/core/data/orgcheck-api-datafactory';
import { Dataset } from 'src/api/core/dataset/orgcheck-api-dataset';
import { SalesforceManagerIntf } from 'src/api/core/salesforce/orgcheck-api-salesforcemanager';
import { SfdcObjectType, SObjectTypes } from 'src/api/data/orgcheck-api-data-objecttype';

const OBJECTTYPES: { id: string; label: string; }[] = [
    { id: SObjectTypes.STANDARD_SOBJECT,        label: 'Standard Object' },
    { id: SObjectTypes.CUSTOM_SOBJECT,          label: 'Custom Object' },
    { id: SObjectTypes.CUSTOM_EXTERNAL_SOBJECT, label: 'External Object' },
    { id: SObjectTypes.CUSTOM_SETTING,          label: 'Custom Setting' },
    { id: SObjectTypes.CUSTOM_METADATA_TYPE,    label: 'Custom Metadata Type' },
    { id: SObjectTypes.CUSTOM_EVENT,            label: 'Platform Event' },
    { id: SObjectTypes.KNOWLEDGE_ARTICLE,       label: 'Knowledge Article' },
    { id: SObjectTypes.CUSTOM_BIG_OBJECT,       label: 'Big Object' }
];

export class DatasetObjectTypes implements Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} _sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Promise<Map<string, SfdcObjectType>>} The result of the dataset
     */
    async run(_sfdcManager: SalesforceManagerIntf, dataFactory: DataFactoryIntf): Promise<Map<string, SfdcObjectType>> {
    
        // Init the factory and records
        const objecTypeDataFactory = dataFactory.getInstance(DataAliases.SfdcObjectType);

        // Return data
        return new Map(OBJECTTYPES.map((type) => [ 
            type.id, 
            objecTypeDataFactory.create({ properties: { id: type.id, label: type.label }}) 
        ]));
    } 
}