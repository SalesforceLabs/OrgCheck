import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { DATASET_CUSTOMFIELDS_ALIAS, 
    DATASET_OBJECTTYPES_ALIAS, 
    DATASET_OBJECTS_ALIAS } from '../core/orgcheck-api-datasetmanager';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';

export class OrgCheckRecipeCustomFields extends OrgCheckRecipe {

    /** 
     * Return the list of dataset you need 
     * 
     * @returns {Array<string>}
     */
    extract() {
        return [
            DATASET_CUSTOMFIELDS_ALIAS, 
            DATASET_OBJECTTYPES_ALIAS, 
            DATASET_OBJECTS_ALIAS
        ];
    }

    /**
     * Get a list of custom fields (async method)
     * 
     * @param {Map} data extracted
     * @param {string} namespace you want to list (optional), '*' for any
     * @param {string} object type you want to list (optional), '*' for any
     * @param {string} object you want to list (optional), '*' for any
     * 
     * @returns {Array<SFDC_Field>}
     */
    async transform(data, namespace, objecttype, object) {
        // Get data
        const types = data.get(DATASET_OBJECTTYPES_ALIAS);
        const objects = data.get(DATASET_OBJECTS_ALIAS);
        const customFields = data.get(DATASET_CUSTOMFIELDS_ALIAS);
        // Augment data
        await OrgCheckProcessor.chaque(objects, (obj) => {
            obj.typeRef = types.get(obj.typeId);
        });
        await OrgCheckProcessor.chaque(customFields, (customField) => {
            customField.objectRef = objects.get(customField.objectId);
        });
        // Filter data
        const array = [];
        await OrgCheckProcessor.chaque(customFields, (customField) => {
            if ((namespace === '*' || customField.package === namespace) &&
                (objecttype === '*' || customField.objectRef?.typeRef?.id === objecttype) &&
                (object === '*' || customField.objectRef?.apiname === object)) {
                array.push(customField);
            }
        });
        // Return data
        return array;
    }
}