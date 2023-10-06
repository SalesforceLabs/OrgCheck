import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { DATASET_OBJECT_ALIAS } from '../core/orgcheck-api-datasetmanager';

export class OrgCheckRecipeObject extends OrgCheckRecipe {

    /** 
     * Return the list of dataset you need 
     * 
     * @returns {Array<Any>}
     */
    extract(object) {
        return [{ name: DATASET_OBJECT_ALIAS, cacheKey: `${DATASET_OBJECT_ALIAS}_${object}`, parameters: { object: object }}];
    }

    /**
     * Get the object information (async method)
     * 
     * @param {OrgCheckMap} data extracted
     * 
     * @returns {SFDC_Object}
     */
    transform(data) {
        return data.get(DATASET_OBJECT_ALIAS);
    }
}