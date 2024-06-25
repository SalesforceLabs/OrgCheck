import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { DATASET_LIGHTNINGPAGES_ALIAS } from '../core/orgcheck-api-datasetmanager';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';

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
    async transform(data, namespace) {
        // Get data
        const pages = data.get(DATASET_LIGHTNINGPAGES_ALIAS);
        // Filter data
        const array = [];
        await OrgCheckProcessor.chaque(pages, (page) => {
            if (namespace === '*' || page.package === namespace) {
                array.push(page);
            }
        });
        // Return data
        return array;
    }
}