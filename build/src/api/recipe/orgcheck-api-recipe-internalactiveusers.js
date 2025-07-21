import { Recipe } from '../core/orgcheck-api-recipe';
import { Processor } from '../core/orgcheck-api-processor';
import { Data, DataWithoutScoring } from '../core/orgcheck-api-data';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { DatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { SFDC_User } from '../data/orgcheck-api-data-user';
import { SFDC_PermissionSet } from '../data/orgcheck-api-data-permissionset';
import { SFDC_Profile } from '../data/orgcheck-api-data-profile';
import { DataMatrix } from '../core/orgcheck-api-data-matrix';

export class RecipeInternalActiveUsers extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfos) that this recipe is using
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Array<string | DatasetRunInformation>} The datasets aliases that this recipe is using
     * @public
     */
    extract(_logger) {
        return [
            DatasetAliases.INTERNALACTIVEUSERS, 
            DatasetAliases.PROFILES, 
            DatasetAliases.PERMISSIONSETS
        ];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map<string, any>} data - Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map<string, any>>} Returns as it is the value returned by the transform method recipe.
     * @async
     * @public
     */
    async transform(data, _logger) {

        // Get data
        const /** @type {Map<string, SFDC_User>} */ users = data.get(DatasetAliases.INTERNALACTIVEUSERS);
        const /** @type {Map<string, SFDC_Profile>} */ profiles = data.get(DatasetAliases.PROFILES);
        const /** @type {Map<string, SFDC_PermissionSet>} */ permissionSets = data.get(DatasetAliases.PERMISSIONSETS);

        // Checking data
        if (!users) throw new Error(`RecipeActiveUsers: Data from dataset alias 'INTERNALACTIVEUSERS' was undefined.`);
        if (!profiles) throw new Error(`RecipeActiveUsers: Data from dataset alias 'PROFILES' was undefined.`);
        if (!permissionSets) throw new Error(`RecipeActiveUsers: Data from dataset alias 'PERMISSIONSETS' was undefined.`);

        // Augment data
        await Processor.forEach(users, async (/** @type {SFDC_User} */ user) => {
            user.profileRef = profiles.get(user.profileId);
            user.permissionSetRefs = await Processor.map(
                user.permissionSetIds,
                (/** @type {string} */ id) => permissionSets.get(id),
                (/** @type {string} */ id) => permissionSets.has(id)
            );
            user.aggregateImportantPermissions = {};
            if (user.profileRef?.importantPermissions) {
                Object.keys(user.profileRef.importantPermissions)
                    .filter((permName) => user.profileRef.importantPermissions[permName] === true)
                    .forEach((permName) => { user.aggregateImportantPermissions[permName] = [ user.profileRef ]; });
            }
            await Processor.forEach(user.permissionSetRefs, (/** @type {SFDC_PermissionSet} */ permissionSet) => {
                Object.keys(permissionSet.importantPermissions)
                    .filter((permName) => permissionSet.importantPermissions[permName] === true)
                    .forEach((permName) => { 
                        if (!user.aggregateImportantPermissions[permName]) user.aggregateImportantPermissions[permName] = []; 
                        user.aggregateImportantPermissions[permName].push(permissionSet);
                    });
            });
        });
        // Return data
        return [... users.values()];
    }
}