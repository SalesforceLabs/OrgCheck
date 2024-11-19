import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { DATASET_VISUALFORCEPAGES_ALIAS } from '../core/orgcheck-api-datasetmanager';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';

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
    async transform(data, namespace) {
        // Get data
        const pages = data.get(DATASET_VISUALFORCEPAGES_ALIAS);
        // Filter data
        const array = [];
        await OrgCheckProcessor.forEach(pages, (page) => {
            if (namespace === '*' || page.package === namespace) {
                array.push(page);
            }
        });
        // Return data
        return array;
    }
}