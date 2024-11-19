import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { DATASET_PROFILES_ALIAS } from '../core/orgcheck-api-datasetmanager';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';

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
    async transform(data, namespace) {
        // Get data
        const profiles = data.get(DATASET_PROFILES_ALIAS);
        // Filter data
        const array = [];
        await OrgCheckProcessor.forEach(profiles, (profile) => {
            if (namespace === '*' || profile.package === namespace) {
                array.push(profile);
            }
        });
        // Return data
        return array;
    }
}