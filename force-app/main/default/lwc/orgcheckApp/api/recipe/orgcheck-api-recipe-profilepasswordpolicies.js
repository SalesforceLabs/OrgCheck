import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { DATASET_PROFILEPWDPOLICY_ALIAS } from '../core/orgcheck-api-datasetmanager';

export class OrgCheckRecipeProfilePasswordPolicies extends OrgCheckRecipe {

    /** 
     * Return the list of dataset you need 
     * 
     * @returns {Array<string>}
     */
    extract() {
        return [ DATASET_PROFILEPWDPOLICY_ALIAS ];
    }

    /**
     * Get a list of profile password policies (async method)
     * 
     * @param {Map} data extracted
     * @param {string} namespace you want to list (optional), '*' for any
     * 
     * @returns {Array<SFDC_ProfilePasswordPolicy>}
     */
    transform(data, namespace) {
        // Get data
        const policies = data.get(DATASET_PROFILEPWDPOLICY_ALIAS);
        // Return all data
        return [... policies.values()];
    }
}