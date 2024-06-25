import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { DATASET_PROFILES_ALIAS,
            DATASET_PROFILERESTRICTIONS_ALIAS } from '../core/orgcheck-api-datasetmanager';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';

export class OrgCheckRecipeProfileRestrictions extends OrgCheckRecipe {

    /** 
     * Return the list of dataset you need 
     * 
     * @returns {Array<string>}
     */
    extract() {
        return [
            DATASET_PROFILES_ALIAS,
            DATASET_PROFILERESTRICTIONS_ALIAS
        ];
    }

    /**
     * Get a list of profile retrictions (async method)
     * 
     * @param {Map} data extracted
     * @param {string} namespace you want to list (optional), '*' for any
     * 
     * @returns {Array<SFDC_ProfileRestriction>}
     */
    async transform(data, namespace) {
        // Get data
        const profiles = data.get(DATASET_PROFILES_ALIAS);
        const profileRestrictions = data.get(DATASET_PROFILERESTRICTIONS_ALIAS);
        // Augment data
        await OrgCheckProcessor.chaque(profileRestrictions, (restriction) => {
            restriction.profileRef = profiles.get(restriction.profileId);
        });
        // Filter data
        const array = [];
        await OrgCheckProcessor.chaque(profileRestrictions, (restriction) => {
            if (namespace === '*' || restriction.profileRef?.package === namespace) {
                array.push(restriction);
            }
        });
        // Return data
        return array;
    }
}