import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { DATASET_USERS_ALIAS,
    DATASET_GROUPS_ALIAS } from '../core/orgcheck-api-datasetmanager';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';

export class OrgCheckRecipeQueues extends OrgCheckRecipe {

    /** 
     * Return the list of dataset you need 
     * 
     * @returns {Array<string>}
     */
    extract() {
        return [DATASET_USERS_ALIAS, DATASET_GROUPS_ALIAS];
    }

    /**
     * Get a list of queues (async method)
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
        await OrgCheckProcessor.chaque(groups, async (group) => {
            group.directUserRefs = await OrgCheckProcessor.carte(
                await OrgCheckProcessor.filtre(group.directUserIds, (id) => users.has(id)),
                (id) => users.get(id)
            );
            group.directGroupRefs = await OrgCheckProcessor.carte(
                await OrgCheckProcessor.filtre(group.directGroupIds, (id) => groups.has(id)),
                (id) => groups.get(id)
            );
            group.indirectUserRefs = await OrgCheckProcessor.carte(
                await OrgCheckProcessor.filtre(group.indirectUserIds, (id) => users.has(id)),
                (id) => users.get(id)
            );

        });

        // Filter data
        const array = [];
        await OrgCheckProcessor.chaque(groups, (group) => {
            if (group.isQueue === true) {
                array.push(group);
            }
        });
        // Return data
        return array;
    }
}