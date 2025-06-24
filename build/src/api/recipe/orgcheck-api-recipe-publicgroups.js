import { Recipe } from '../core/orgcheck-api-recipe';
import { Processor } from '../core/orgcheck-api-processor';
import { Data, DataWithoutScoring } from '../core/orgcheck-api-data';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { DatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { SFDC_User } from '../data/orgcheck-api-data-user';
import { SFDC_Group } from '../data/orgcheck-api-data-group';
import { DataMatrix } from '../core/orgcheck-api-data-matrix';

export class RecipePublicGroups extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {SimpleLoggerIntf} logger
     * @returns {Array<string | DatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [DatasetAliases.INTERNALACTIVEUSERS, DatasetAliases.PUBLIC_GROUPS_AND_QUEUES];
    }

    /**
     * @description transform the data from the datasets and return the final result as an Array
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger) {

        // Get data
        const /** @type {Map<string, SFDC_Group>} */ groups = data.get(DatasetAliases.PUBLIC_GROUPS_AND_QUEUES);
        const /** @type {Map<string, SFDC_User>} */ users = data.get(DatasetAliases.INTERNALACTIVEUSERS);

        // Checking data
        if (!groups) throw new Error(`RecipePublicGroups: Data from dataset alias 'PUBLIC_GROUPS_AND_QUEUES' was undefined.`);
        if (!users) throw new Error(`RecipePublicGroups: Data from dataset alias 'INTERNALACTIVEUSERS' was undefined.`);

        // Augment and filter data
        const array = [];
        await Processor.forEach(groups, async (group) => {
            // Augment data
            group.directUserRefs = await Processor.map(
                group.directUserIds,
                (id) => users.get(id),
                (id) => users.has(id)
            );
            group.directGroupRefs = await Processor.map(
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