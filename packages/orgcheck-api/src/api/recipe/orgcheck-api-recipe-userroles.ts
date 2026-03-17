import { Recipe } from 'src/api/core/orgcheck-api-recipe';
import { Processor } from 'src/api/core/orgcheck-api-processor';
import { Data } from 'src/api/core/orgcheck-api-data';
import { DataMatrixIntf } from 'src/api/core/orgcheck-api-data-matrix';
import { SimpleLoggerIntf } from 'src/api/core/orgcheck-api-logger';
import { DatasetRunInformation } from 'src/api/core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from 'src/api/core/orgcheck-api-datasets-aliases';
import { SfdcUserRole }from 'src/api/data/orgcheck-api-data-userrole';
import { SfdcUser }from 'src/api/data/orgcheck-api-data-user';

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
     * @returns {Promise<Array<Data> | DataMatrixIntf | Data | Map<string, any>>} Returns as it is the value returned by the transform method recipe.
     * @async
     * @public
     */
    async transform(data: Map<string, any>, _logger: SimpleLoggerIntf): Promise<Array<Data> | DataMatrixIntf | Data | Map<string, any>> {

        // Get data
        const /** @type {Map<string, SfdcUserRole>} */ userRoles: Map<string, SfdcUserRole> = data.get(DatasetAliases.USERROLES);
        const /** @type {Map<string, SfdcUser>} */ users: Map<string, SfdcUser> = data.get(DatasetAliases.INTERNALACTIVEUSERS);

        // Checking data
        if (!userRoles) throw new Error(`RecipeUserRoles: Data from dataset alias 'USERROLES' was undefined.`);
        if (!users) throw new Error(`RecipeUserRoles: Data from dataset alias 'USERS' was undefined.`);

        // Augment data
        await Processor.forEach(userRoles, async (/** @type {SfdcUserRole} */ userRole: SfdcUserRole) => {
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