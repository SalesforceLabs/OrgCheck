import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { DATASET_GROUPS_ALIAS } from '../core/orgcheck-api-datasetmanager';

export class OrgCheckRecipePublicGroups extends OrgCheckRecipe {

    /** 
     * Return the list of dataset you need 
     * 
     * @returns {Array<string>}
     */
    extract() {
        return [DATASET_GROUPS_ALIAS];
    }

    /**
     * Get a list of public groups (async method)
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
            if (group.isPublicGroup === true) {
                array.push(group);
            }
        }
        // Return data
        return array;
    }
}