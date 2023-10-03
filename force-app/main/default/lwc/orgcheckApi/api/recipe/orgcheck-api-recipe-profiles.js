import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { DATASET_PROFILES_ALIAS } from '../core/orgcheck-api-datasetmanager';

export class OrgCheckRecipeProfiles extends OrgCheckRecipe {

    /** 
     * Return the list of dataset you need 
     * 
     * @returns {Any}
     */
    extract() {
        return [DATASET_PROFILES_ALIAS];
    }

    /**
     * Get a list of active users (async method)
     * 
     * @returns {Array<SFDC_User>}
     */
    transform(data, namespace) {
        const profiles = data.get(DATASET_PROFILES_ALIAS);
        return profiles.filterValues((profile) => {
            if (namespace !== '*' && profile.package !== namespace) return false;
            return true;
        });
    }
}