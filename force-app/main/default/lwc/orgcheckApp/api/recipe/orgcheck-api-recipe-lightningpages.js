import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { DATASET_LIGHTNINGPAGES_ALIAS } from '../core/orgcheck-api-datasetmanager';

export class OrgCheckRecipeLightningPages extends OrgCheckRecipe {

    /** 
     * Return the list of dataset you need 
     * 
     * @returns {Array<string>}
     */
    extract() {
        return [DATASET_LIGHTNINGPAGES_ALIAS];
    }

    /**
     * Get a list of Ligthning Pages (async method)
     * 
     * @param {Map} data extracted
     * @param {string} namespace you want to list (optional), '*' for any
     * 
     * @returns {Array<SFDC_LightningPages>}
     */
    transform(data, namespace) {
        // Get data
        const pages = data.get(DATASET_LIGHTNINGPAGES_ALIAS);
        // Filter data
        const array = [];
        pages.forEach((page) => {
            if (namespace === '*' || page.package === namespace) {
                array.push(page);
            }
        });
        // Return data
        return array;
    }
}