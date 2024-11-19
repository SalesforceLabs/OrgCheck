import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { DATASET_USERS_ALIAS, 
    DATASET_GROUPS_ALIAS } from '../core/orgcheck-api-datasetmanager';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';

export class OrgCheckRecipeGroups extends OrgCheckRecipe {

    /** 
     * Return the list of dataset you need 
     * 
     * @returns {Array<string>}
     */
    extract() {
        return [DATASET_USERS_ALIAS, DATASET_GROUPS_ALIAS];
    }

    /**
     * Get a list of public groups and queues (async method)
     * 
     * @param {Map} data extracted
     * 
     * @returns {Array<SFDC_Group>}
     */
    async transform(data) {
        // Get data
        const groups = data.get(DATASET_GROUPS_ALIAS);
        const users = data.get(DATASET_USERS_ALIAS);

        // Augment data
        await OrgCheckProcessor.forEach(groups, async (group) => {
            group.directUserRefs = await OrgCheckProcessor.map(
                group.directUserIds,
                (id) => users.get(id),
                (id) => users.has(id)
            );
            group.directGroupRefs = await OrgCheckProcessor.map(
                group.directGroupIds,
                (id) => groups.get(id),
                (id) => groups.has(id)
            );
        });

        // Filter data
        const array = [];
        await OrgCheckProcessor.forEach(groups, async (group) => {
            if (group.isPublicGroup === true || group.isQueue === true) {
                array.push(group);
            }
        });

        // Return data
        return array;
    }
}