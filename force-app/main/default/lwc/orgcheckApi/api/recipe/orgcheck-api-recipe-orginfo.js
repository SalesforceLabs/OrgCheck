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
     * @param {OrgCheckMap} data extracted
     * 
     * @returns {SFDC_OrgInfo}
     */
    transform(data) {
        const orgInfo = data.get(DATASET_ORGINFO_ALIAS);
        return orgInfo.allValues()[0];
    }
}