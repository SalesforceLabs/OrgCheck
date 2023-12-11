import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { DATASET_VISUALFORCEOMPONENTS_ALIAS } from '../core/orgcheck-api-datasetmanager';

export class OrgCheckRecipeVisualForceComponents extends OrgCheckRecipe {

    /** 
     * Return the list of dataset you need 
     * 
     * @returns {Array<string>}
     */
    extract() {
        return [DATASET_VISUALFORCEOMPONENTS_ALIAS];
    }

    /**
     * Get a list of VF Components (async method)
     * 
     * @param {Map} data extracted
     * @param {string} namespace you want to list (optional), '*' for any
     * 
     * @returns {Array<SFDC_VisualForceComponent>}
     */
    transform(data, namespace) {
        // Get data
        const components = data.get(DATASET_VISUALFORCEOMPONENTS_ALIAS);
        // Filter data
        const array = [];
        for (const component of components.values()) {
            if (namespace === '*' || component.package === namespace) {
                array.push(component);
            }
        }
        // Return data
        return array;
    }
}