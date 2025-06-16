import { Recipe } from '../core/orgcheck-api-recipe';
import { Processor } from '../core/orgcheck-api-processing';
import { Data, DataWithoutScoring } from '../core/orgcheck-api-data';
import { DataMatrix } from '../core/orgcheck-api-data-matrix';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { DatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { SFDC_UserRole } from '../data/orgcheck-api-data-userrole';
import { SFDC_User } from '../data/orgcheck-api-data-user';

export class RecipeUserRoles extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {SimpleLoggerIntf} logger
     * @returns {Array<string | DatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [
            DatasetAliases.USERROLES,
            DatasetAliases.INTERNALACTIVEUSERS
        ];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger) {

        // Get data
        const /** @type {Map<string, SFDC_UserRole>} */ userRoles = data.get(DatasetAliases.USERROLES);
        const /** @type {Map<string, SFDC_User>} */ users = data.get(DatasetAliases.INTERNALACTIVEUSERS);

        // Checking data
        if (!userRoles) throw new Error(`RecipeUserRoles: Data from dataset alias 'USERROLES' was undefined.`);
        if (!users) throw new Error(`RecipeUserRoles: Data from dataset alias 'USERS' was undefined.`);

        // Augment data
        await Processor.forEach(userRoles, async (userRole) => {
            // Augment data
            if (userRole.hasActiveMembers === true) {
                userRole.activeMemberRefs = await Processor.map(userRole.activeMemberIds, (id) => users.get(id));
            }
            if (userRole.hasParent === true) {
                userRole.parentRef = userRoles.get(userRole.parentId);
            }
        });

        // Return data
        return [... userRoles.values()];
    }
}