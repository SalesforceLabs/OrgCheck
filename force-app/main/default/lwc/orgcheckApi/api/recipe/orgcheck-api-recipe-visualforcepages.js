import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { DATASET_VISUALFORCEPAGES_ALIAS } from '../core/orgcheck-api-datasetmanager';

export class OrgCheckRecipeVisualForcePages extends OrgCheckRecipe {

    /** 
     * Return the list of dataset you need 
     * 
     * @returns {Any}
     */
    extract() {
        return [DATASET_VISUALFORCEPAGES_ALIAS];
    }

    /**
     * Get a list of active users (async method)
     * 
     * @returns {Array<SFDC_User>}
     */
    transform(data, namespace) {
        const pages = data.get(DATASET_VISUALFORCEPAGES_ALIAS);
        return pages.filterValues((customLabel) => {
            if (namespace !== '*' && customLabel.package !== namespace) return false;
            return true;
        });
    }
}