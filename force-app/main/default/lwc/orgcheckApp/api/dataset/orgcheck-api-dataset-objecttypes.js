import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { SFDC_ObjectType,
    OBJECTTYPE_ID_STANDARD_SOBJECT, 
    OBJECTTYPE_ID_CUSTOM_SOBJECT, 
    OBJECTTYPE_ID_CUSTOM_EXTERNAL_SOBJECT,
    OBJECTTYPE_ID_CUSTOM_SETTING, 
    OBJECTTYPE_ID_CUSTOM_METADATA_TYPE, 
    OBJECTTYPE_ID_CUSTOM_EVENT,
    OBJECTTYPE_ID_KNOWLEDGE_ARTICLE, 
    OBJECTTYPE_ID_CUSTOM_BIG_OBJECT } from '../data/orgcheck-api-data-objecttype';

export class OrgCheckDatasetObjectTypes extends OrgCheckDataset {

    async run(sfdcManager, dataFactory, localLogger) {
    
        // Init the factory
        const objecTypeDataFactory = dataFactory.getInstance(SFDC_ObjectType);

        // Return data
        return new Map(
            [
                { id: OBJECTTYPE_ID_STANDARD_SOBJECT,        label: 'Standard Object' },
                { id: OBJECTTYPE_ID_CUSTOM_SOBJECT,          label: 'Custom Object' },
                { id: OBJECTTYPE_ID_CUSTOM_EXTERNAL_SOBJECT, label: 'External Object' },
                { id: OBJECTTYPE_ID_CUSTOM_SETTING,          label: 'Custom Setting' },
                { id: OBJECTTYPE_ID_CUSTOM_METADATA_TYPE,    label: 'Custom Metadata Type' },
                { id: OBJECTTYPE_ID_CUSTOM_EVENT,            label: 'Platform Event' },
                { id: OBJECTTYPE_ID_KNOWLEDGE_ARTICLE,       label: 'Knowledge Article' },
                { id: OBJECTTYPE_ID_CUSTOM_BIG_OBJECT,       label: 'Big Object' }
            ].map((e) => [ 
                e.id, 
                objecTypeDataFactory.create({ id: e.id, label: e.label })
            ])
        );
    } 
}