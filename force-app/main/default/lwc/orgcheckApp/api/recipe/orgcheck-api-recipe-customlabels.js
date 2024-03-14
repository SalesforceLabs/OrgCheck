import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { DATASET_CUSTOMLABELS_ALIAS } from '../core/orgcheck-api-datasetmanager';

export class OrgCheckRecipeCustomLabels extends OrgCheckRecipe {

    /** 
     * Return the list of dataset you need 
     * 
     * @returns {Array<string>}
     */
    extract() {
        return [DATASET_CUSTOMLABELS_ALIAS];
    }

    /**
     * Get a list of custom labels (async method)
     * 
     * @param {Map} data extracted
     * @param {string} namespace you want to list (optional), '*' for any
     * 
     * @returns {Array<SFDC_CustomLabel>}
     */
    transform(data, namespace) {
        // Get data
        const customLabels = data.get(DATASET_CUSTOMLABELS_ALIAS);
        // Filter data
        const array = [];
        for (const customLabel of customLabels.values()) {
            if (namespace === '*' || customLabel.package === namespace) {
                array.push(customLabel);
            }
        }
        // Return data
        return array;
    }
}