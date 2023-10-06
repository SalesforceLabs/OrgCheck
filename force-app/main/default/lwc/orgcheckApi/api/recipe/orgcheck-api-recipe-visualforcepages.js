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
     * @param {OrgCheckMap} data extracted
     * @param {string} namespace you want to list (optional), '*' for any
     * 
     * @returns {Array<SFDC_VisualForcePage>}
     */
    transform(data, namespace) {
        const pages = data.get(DATASET_VISUALFORCEPAGES_ALIAS);
        return pages.filterValues((customLabel) => {
            if (namespace !== '*' && customLabel.package !== namespace) return false;
            return true;
        });
    }
}