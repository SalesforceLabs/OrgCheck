import { Recipe } from '../core/orgcheck-api-recipe';
import { Processor } from '../core/orgcheck-api-processing';
import { Data } from '../core/orgcheck-api-data';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { DatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { SFDC_User } from '../data/orgcheck-api-data-user';
import { SFDC_Group } from '../data/orgcheck-api-data-group';

export class RecipeQueues extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {SimpleLoggerIntf} logger
     * @returns {Array<string | DatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [DatasetAliases.USERS, DatasetAliases.GROUPS];
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
        const /** @type {Map<string, SFDC_Group>} */ groups = data.get(DatasetAliases.GROUPS);
        const /** @type {Map<string, SFDC_User>} */ users = data.get(DatasetAliases.USERS);

        // Checking data
        if (!groups) throw new Error(`Data from dataset alias 'GROUPS' was undefined.`);
        if (!users) throw new Error(`Data from dataset alias 'USERS' was undefined.`);

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
            if (group.isQueue === true) {
                array.push(group);
            }
        });

        // Return data
        return array;
    }
}