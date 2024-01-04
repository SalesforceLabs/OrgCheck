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
     * @param {Map} data extracted
     * @param {string} namespace you want to list (optional), '*' for any
     * 
     * @returns {Array<SFDC_Profile>}
     */
    transform(data, namespace) {
        // Get data
        const profiles = data.get(DATASET_PROFILES_ALIAS);
        // Filter data
        const array = [];
        for (const profile of profiles.values()) {
            if (namespace === '*' || profile.package === namespace) {
                array.push(profile);
            }
        }
        // Return data
        return array;
    }
}