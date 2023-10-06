import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { DATASET_PROFILES_ALIAS } from '../core/orgcheck-api-datasetmanager';

export class OrgCheckRecipeProfiles extends OrgCheckRecipe {

    /** 
     * Return the list of dataset you need 
     * 
     * @returns {Array<string>}
     */
    extract() {
        return [DATASET_PROFILES_ALIAS];
    }

    /**
     * Get a list of profiles (async method)
     * 
     * @param {OrgCheckMap} data extracted
     * @param {string} namespace you want to list (optional), '*' for any
     * 
     * @returns {Array<SFDC_Profile>}
     */
    transform(data, namespace) {
        const profiles = data.get(DATASET_PROFILES_ALIAS);
        return profiles.filterValues((profile) => {
            if (namespace !== '*' && profile.package !== namespace) return false;
            return true;
        });
    }
}