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
     * @param {Map} data extracted
     * 
     * @returns {Array<SFDC_Group>}
     */
    transform(data) {
        // Get data
        const groups = data.get(DATASET_GROUPS_ALIAS);
        // Filter data
        const array = [];
        for (const group of groups.values()) {
            if (group.isQueue === true) {
                array.push(group);
            }
        }
        // Return data
        return array;
    }
}