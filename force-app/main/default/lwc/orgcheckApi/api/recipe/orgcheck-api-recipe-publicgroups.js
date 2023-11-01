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
     * @param {OrgCheckMap} data extracted
     * 
     * @returns {Array<SFDC_Group>}
     */
    transform(data) {
        const start = Date.now();

        const groups = data.get(DATASET_GROUPS_ALIAS);
        const g = groups.filterValues((group) => {
            return group.isPublicGroup === true;
        });

        const end = Date.now();
        console.error('recipe-public-groups.run()', start, end, end-start);

        return g;
    }
}