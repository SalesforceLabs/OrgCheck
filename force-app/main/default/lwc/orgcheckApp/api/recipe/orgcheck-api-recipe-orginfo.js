import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { DATASET_ORGINFO_ALIAS } from '../core/orgcheck-api-datasetmanager';

export class OrgCheckRecipeOrgInformation extends OrgCheckRecipe {

    /** 
     * Return the list of dataset you need 
     * 
     * @returns {Array<string>}
     */
    extract() {
        return [DATASET_ORGINFO_ALIAS];
    }

    /**
     * Get the information of the current org (async method)
     * 
     * @param {Map} data extracted
     * 
     * @returns {SFDC_OrgInfo}
     */
    transform(data) {
        // Get data
        const orgInfoAsMap = data.get(DATASET_ORGINFO_ALIAS);
        // Augment data
        // Filter data
        let orgInfo;
        orgInfoAsMap.forEach((oi) => orgInfo = oi);
        return orgInfo;
    }
}