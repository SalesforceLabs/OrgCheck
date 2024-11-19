import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { DATASET_OBJECT_ALIAS, 
    DatasetRunInformation, 
    DATASET_OBJECTTYPES_ALIAS, 
    DATASET_APEXTRIGGERS_ALIAS,
    DATASET_CUSTOMFIELDS_ALIAS} from '../core/orgcheck-api-datasetmanager';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';

export class OrgCheckRecipeObject extends OrgCheckRecipe {

    /** 
     * Return the list of dataset you need 
     * 
     * @returns {Array<string|DatasetRunInformation>}
     */
    extract(object) {
        const datasetRunInfoObject = new DatasetRunInformation(DATASET_OBJECT_ALIAS, `${DATASET_OBJECT_ALIAS}_${object}`);
        const datasetRunInfoCustomField = new DatasetRunInformation(DATASET_CUSTOMFIELDS_ALIAS, `${DATASET_CUSTOMFIELDS_ALIAS}_${object}`);
        datasetRunInfoObject.parameters.set('object', object);
        datasetRunInfoCustomField.parameters.set('object', object);
        return [ datasetRunInfoObject, 
            DATASET_OBJECTTYPES_ALIAS,
            DATASET_APEXTRIGGERS_ALIAS,
            datasetRunInfoCustomField
        ];
    }

    /**
     * Get the object information (async method)
     * 
     * @param {Map} data extracted
     * 
     * @returns {SFDC_Object}
     */
    async transform(data) {
        const types = data.get(DATASET_OBJECTTYPES_ALIAS);
        const object = data.get(DATASET_OBJECT_ALIAS);
        const apexTriggers = data.get(DATASET_APEXTRIGGERS_ALIAS);
        const customFields = data.get(DATASET_CUSTOMFIELDS_ALIAS);
        // Augment data
        object.typeRef = types.get(object.typeId);
        object.apexTriggerRefs = await OrgCheckProcessor.map(
            object.apexTriggerIds,
            (id) => { 
                const apexTrigger = apexTriggers.get(id);
                apexTrigger.objectRef = object;
                return apexTrigger;
            },
            (id) => apexTriggers.has(id)
        );
        object.customFieldRefs = await OrgCheckProcessor.map(
            object.customFieldIds,
            (id) => { 
                const customField = customFields.get(id);
                customField.objectRef = object;
                return customField;
            },
            (id) => customFields.has(id)
        );
        // Return data
        return object;
    }
}