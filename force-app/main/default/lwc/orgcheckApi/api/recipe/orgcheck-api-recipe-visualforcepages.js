import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { DATASET_VISUALFORCEPAGES_ALIAS } from '../core/orgcheck-api-datasetmanager';

export class OrgCheckRecipeVisualForcePages extends OrgCheckRecipe {

    /** 
     * Return the list of dataset you need 
     * 
     * @returns {Array<string>}
     */
    extract() {
        return [DATASET_VISUALFORCEPAGES_ALIAS];
    }

    /**
     * Get a list of vf pages (async method)
     * 
     * @param {Map} data extracted
     * @param {string} namespace you want to list (optional), '*' for any
     * 
     * @returns {Array<SFDC_VisualForcePage>}
     */
    transform(data, namespace) {
        // Get data
        const pages = data.get(DATASET_VISUALFORCEPAGES_ALIAS);
        // Filter data
        const array = [];
        for (const page of pages.values()) {
            if (namespace === '*' || page.package === namespace) {
                array.push(page);
            }
        }
        // Return data
        return array;
    }
}