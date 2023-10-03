import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { DATASET_CUSTOMFIELDS_ALIAS, 
    DATASET_OBJECTTYPES_ALIAS, 
    DATASET_OBJECTS_ALIAS } from '../core/orgcheck-api-datasetmanager';

export class OrgCheckRecipeCustomFields extends OrgCheckRecipe {

    /** 
     * Return the list of dataset you need 
     * 
     * @returns {Any}
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
     * @param namespace you want to list (optional), '*' for any
     * @param object type you want to list (optional), '*' for any
     * @param object you want to list (optional), '*' for any
     * 
     * @returns {Array<SFDC_CustomField>}
     */
    transform(data, namespace, objecttype, object) {
        const types = data.get(DATASET_OBJECTTYPES_ALIAS);
        const objects = data.get(DATASET_OBJECTS_ALIAS);
        const customFields = data.get(DATASET_CUSTOMFIELDS_ALIAS);
        objects.forEachValue((obj) => {
            obj.typeRef = types.get(obj.typeId);
        });
        customFields.forEachValue((customField) => {
            customField.objectRef = objects.get(customField.objectId);
        });
        return customFields.filterValues((customField) => {
            if (namespace !== '*' && customField.package !== namespace) return false;
            if (objecttype !== '*' && customField.objectRef?.typeRef?.id !== objecttype) return false;
            if (object !== '*' && customField.objectRef?.apiname !== object) return false;
            return true;
        });
    }
}