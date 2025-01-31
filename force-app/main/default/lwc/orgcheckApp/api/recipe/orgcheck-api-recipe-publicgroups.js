import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';
import { OrgCheckData } from '../core/orgcheck-api-data';
import { OrgCheckSimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { OrgCheckDatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { OrgCheckDatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { SFDC_User } from '../data/orgcheck-api-data-user';
import { SFDC_Group } from '../data/orgcheck-api-data-group';

export class OrgCheckRecipePublicGroups extends OrgCheckRecipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {OrgCheckSimpleLoggerIntf} logger
     * @returns {Array<string | OrgCheckDatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [OrgCheckDatasetAliases.USERS, OrgCheckDatasetAliases.GROUPS];
    }

    /**
     * @description transform the data from the datasets and return the final result as an Array
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {OrgCheckSimpleLoggerIntf} logger
     * @returns {Promise<Array<OrgCheckData>>}
     * @async
     * @public
     */
    async transform(data, logger) {

        // Get data
        const /** @type {Map<string, SFDC_Group>} */ groups = data.get(OrgCheckDatasetAliases.GROUPS);
        const /** @type {Map<string, SFDC_User>} */ users = data.get(OrgCheckDatasetAliases.USERS);

        // Checking data
        if (!groups) throw new Error(`Data from dataset alias 'GROUPS' was undefined.`);
        if (!users) throw new Error(`Data from dataset alias 'USERS' was undefined.`);

        // Augment and filter data
        const array = [];
        await OrgCheckProcessor.forEach(groups, async (group) => {
            // Augment data
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
            // Filter data
            if (group.isPublicGroup === true) {
                array.push(group);
            }
        });

        // Return data
        return array;
    }
}