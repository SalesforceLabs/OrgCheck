import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { DATASET_GROUPS_ALIAS } from '../core/orgcheck-api-datasetmanager';

export class OrgCheckRecipeQueues extends OrgCheckRecipe {

    /** 
     * Return the list of dataset you need 
     * 
     * @returns {Array<string>}
     */
    extract() {
        return [DATASET_GROUPS_ALIAS];
    }

    /**
     * Get a list of queues (async method)
     * 
     * @param {OrgCheckMap} data extracted
     * 
     * @returns {Array<SFDC_Group>}
     */
    transform(data) {
        const groups = data.get(DATASET_GROUPS_ALIAS);
        return groups.filterValues((group) => {
            return group.isQueue === true;
        });
    }
}