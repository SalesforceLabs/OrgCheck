import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { DATASET_USERS_ALIAS, 
    DATASET_GROUPS_ALIAS } from '../core/orgcheck-api-datasetmanager';

export class OrgCheckRecipePublicGroups extends OrgCheckRecipe {

    /** 
     * Return the list of dataset you need 
     * 
     * @returns {Array<string>}
     */
    extract() {
        return [DATASET_USERS_ALIAS, DATASET_GROUPS_ALIAS];
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
        const users = data.get(DATASET_USERS_ALIAS);

        // Augment data
        groups.forEach((group) => {
            group.directUserRefs = group.directUserIds?.filter((id) => users.has(id)).map((id) => users.get(id)) || [];
            group.directGroupRefs = group.directGroupIds?.filter((id) => groups.has(id)).map((id) => groups.get(id)) || [];
            group.indirectUserRefs = group.indirectUserIds?.filter((id) => users.has(id)).map((id) => users.get(id)) || [];
        });

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