import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { DATASET_OBJECT_ALIAS, 
    DatasetRunInformation, 
    DATASET_OBJECTTYPES_ALIAS, 
    DATASET_APEXTRIGGERS_ALIAS,
    DATASET_CUSTOMFIELDS_ALIAS} from '../core/orgcheck-api-datasetmanager';

export class OrgCheckRecipeObject extends OrgCheckRecipe {

    /** 
     * Return the list of dataset you need 
     * 
     * @returns {Array<string|DatasetRunInformation>}
     */
    extract(object) {
        const datasetRunInfo = new DatasetRunInformation(DATASET_OBJECT_ALIAS, `${DATASET_OBJECT_ALIAS}_${object}`);
        datasetRunInfo.parameters.set('object', object);
        return [ datasetRunInfo, 
            DATASET_OBJECTTYPES_ALIAS,
            DATASET_APEXTRIGGERS_ALIAS,
            DATASET_CUSTOMFIELDS_ALIAS
        ];
    }

    /**
     * Get the object information (async method)
     * 
     * @param {Map} data extracted
     * 
     * @returns {SFDC_Object}
     */
    transform(data) {
        const types = data.get(DATASET_OBJECTTYPES_ALIAS);
        const object = data.get(DATASET_OBJECT_ALIAS);
        const apexTriggers = data.get(DATASET_APEXTRIGGERS_ALIAS);
        const customFields = data.get(DATASET_CUSTOMFIELDS_ALIAS);
        // Augment data
        object.typeRef = types.get(object.typeId);
        object.apexTriggerRefs = object.apexTriggerIds
            .filter((id) => {
                if (apexTriggers.has(id)) return true;
                console.error('Unknown Apex Trigger id', id, ' for Object ', object, ' in Apex Triggers list ', apexTriggers);
                return false;
            })
            .map((id) => { 
                const t = apexTriggers.get(id); // can't be null 
                t.objectRef = object; 
                return t; 
            });
        object.customFieldRefs = object.customFieldIds
            .filter((id) => {
                if (customFields.has(id)) return true;
                console.error('Unknown Custom Field id', id, ' for Object ', object, ' in Custom Field list ', customFields);
                return false;
            })
            .map((id) => { 
                const f = customFields.get(id); // can't be null
                f.objectRef = object; 
                return f; 
            });
        // Return data
        return object;
    }
}