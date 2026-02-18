import { Recipe } from '../core/orgcheck-api-recipe';
import { Processor } from '../core/orgcheck-api-processor';
import { Data, DataWithoutScore } from '../core/orgcheck-api-data';
import { DataMatrix } from '../core/orgcheck-api-data-matrix';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { DatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { SFDC_UserRole } from '../data/orgcheck-api-data-userrole';
import { SFDC_User } from '../data/orgcheck-api-data-user';

export class RecipeUserRoles implements Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfos) that this recipe is using
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Array<string | DatasetRunInformation>} The datasets aliases that this recipe is using
     * @public
     */
    extract(_logger: SimpleLoggerIntf): Array<string | DatasetRunInformation> {
        return [
            DatasetAliases.USERROLES,
            DatasetAliases.INTERNALACTIVEUSERS
        ];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map<string, any>} data - Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Promise<Array<Data> | DataMatrix | Data | Map<string, any>>} Returns as it is the value returned by the transform method recipe.
     * @async
     * @public
     */
    async transform(data: Map<string, any>, _logger: SimpleLoggerIntf): Promise<Array<Data> | DataMatrix | Data | Map<string, any>> {

        // Get data
        const /** @type {Map<string, SFDC_UserRole>} */ userRoles: Map<string, SFDC_UserRole> = data.get(DatasetAliases.USERROLES);
        const /** @type {Map<string, SFDC_User>} */ users: Map<string, SFDC_User> = data.get(DatasetAliases.INTERNALACTIVEUSERS);

        // Checking data
        if (!userRoles) throw new Error(`RecipeUserRoles: Data from dataset alias 'USERROLES' was undefined.`);
        if (!users) throw new Error(`RecipeUserRoles: Data from dataset alias 'USERS' was undefined.`);

        // Augment data
        await Processor.forEach(userRoles, async (/** @type {SFDC_UserRole} */ userRole: SFDC_UserRole) => {
            // Augment data
            if (userRole.hasActiveMembers === true) {
                userRole.activeMemberRefs = await Processor.map(userRole.activeMemberIds, (/** @type {string} */ id: string) => users.get(id));
            }
            if (userRole.hasParent === true) {
                const parentRef = userRoles.get(userRole.parentId);
                if (parentRef) {
                    userRole.parentRef = parentRef;
                }
            }
        });

        // Return data
        return [... userRoles.values()];
    }
}