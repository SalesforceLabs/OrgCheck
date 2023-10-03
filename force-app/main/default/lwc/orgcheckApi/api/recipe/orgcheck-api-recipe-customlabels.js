import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { DATASET_CUSTOMLABELS_ALIAS } from '../core/orgcheck-api-datasetmanager';

export class OrgCheckRecipeCustomLabels extends OrgCheckRecipe {

    /** 
     * Return the list of dataset you need 
     * 
     * @returns {Any}
     */
    extract() {
        return [DATASET_CUSTOMLABELS_ALIAS];
    }

    /**
     * Get a list of active users (async method)
     * 
     * @returns {Array<SFDC_User>}
     */
    transform(data, namespace) {
        const customLabels = data.get(DATASET_CUSTOMLABELS_ALIAS);
        return customLabels.filterValues((customLabel) => {
            if (namespace !== '*' && customLabel.package !== namespace) return false;
            return true;
        });
    }
}