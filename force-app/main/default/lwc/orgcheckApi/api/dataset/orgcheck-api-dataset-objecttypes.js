import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { OrgCheckMap } from '../core/orgcheck-api-type-map';
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

    run(sfdcManager, resolve, reject) {

        try {

            // Init the map
            const types = new OrgCheckMap();

            // Set the map
            [
                { id: OBJECTTYPE_ID_STANDARD_SOBJECT,        label: 'Standard Object' },
                { id: OBJECTTYPE_ID_CUSTOM_SOBJECT,          label: 'Custom Object' },
                { id: OBJECTTYPE_ID_CUSTOM_EXTERNAL_SOBJECT, label: 'External Object' },
                { id: OBJECTTYPE_ID_CUSTOM_SETTING,          label: 'Custom Setting' },
                { id: OBJECTTYPE_ID_CUSTOM_METADATA_TYPE,    label: 'Custom Metadata Type' },
                { id: OBJECTTYPE_ID_CUSTOM_EVENT,            label: 'Platform Event' },
                { id: OBJECTTYPE_ID_KNOWLEDGE_ARTICLE,       label: 'Knowledge Article' },
                { id: OBJECTTYPE_ID_CUSTOM_BIG_OBJECT,       label: 'Big Object' }
            ].forEach((e) => { 
                types.set(e.id, new SFDC_ObjectType({id: e.id, label: e.label})); 
            });

            // Return data
            resolve(types);
        } catch(error) { 
            reject(error); 
        }
    } 
}