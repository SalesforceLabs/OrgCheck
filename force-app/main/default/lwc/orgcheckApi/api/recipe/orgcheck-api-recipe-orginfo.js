import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { DATASET_ORGINFO_ALIAS } from '../core/orgcheck-api-datasetmanager';

export class OrgCheckRecipeOrgInformation extends OrgCheckRecipe {

    /** 
     * Return the list of dataset you need 
     * 
     * @returns {Any}
     */
    extract() {
        return [DATASET_ORGINFO_ALIAS];
    }

    /**
     * Get a list of active users (async method)
     * 
     * @returns {Array<SFDC_User>}
     */
    transform(data) {
        const orgInfo = data.get(DATASET_ORGINFO_ALIAS);
        return orgInfo.allValues()[0];
    }
}