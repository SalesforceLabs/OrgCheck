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
     * @param {OrgCheckMap} data extracted
     * @param {string} namespace you want to list (optional), '*' for any
     * 
     * @returns {Array<SFDC_CustomLabel>}
     */
    transform(data, namespace) {
        const customLabels = data.get(DATASET_CUSTOMLABELS_ALIAS);
        return customLabels.filterValues((customLabel) => {
            if (namespace !== '*' && customLabel.package !== namespace) return false;
            return true;
        });
    }
}