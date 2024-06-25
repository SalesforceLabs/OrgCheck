import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { DATASET_ORGANIZATION_ALIAS } from '../core/orgcheck-api-datasetmanager';

export class OrgCheckRecipeOrganization extends OrgCheckRecipe {

    /** 
     * Return the list of dataset you need 
     * 
     * @returns {Array<string>}
     */
    extract() {
        return [DATASET_ORGANIZATION_ALIAS];
    }

    /**
     * Get the information of the current org (async method)
     * 
     * @param {Map} data extracted
     * 
     * @returns {SFDC_Organization}
     */
    async transform(data) {
        // Get data
        const organization = data.get(DATASET_ORGANIZATION_ALIAS);
        
        // Only getting the first record (we expect only one!!)
        return organization.values().next().value;
    }
}