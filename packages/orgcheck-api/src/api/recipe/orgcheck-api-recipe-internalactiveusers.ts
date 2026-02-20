import { Recipe } from '../core/orgcheck-api-recipe';
import { Processor } from '../core/orgcheck-api-processor';
import { Data } from '../core/orgcheck-api-data';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { DatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { SFDC_User } from '../data/orgcheck-api-data-user';
import { SFDC_PermissionSet } from '../data/orgcheck-api-data-permissionset';
import { SFDC_Profile } from '../data/orgcheck-api-data-profile';
import { DataMatrix } from '../core/orgcheck-api-data-matrix';

export class RecipeInternalActiveUsers implements Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfos) that this recipe is using
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Array<string | DatasetRunInformation>} The datasets aliases that this recipe is using
     * @public
     */
    extract(_logger: SimpleLoggerIntf): Array<string | DatasetRunInformation> {
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
     * @returns {Promise<Array<Data> | DataMatrix | Data | Map<string, any>>} Returns as it is the value returned by the transform method recipe.
     * @async
     * @public
     */
    async transform(data: Map<string, any>, _logger: SimpleLoggerIntf): Promise<Array<Data> | DataMatrix | Data | Map<string, any>> {

        // Get data
        const /** @type {Map<string, SFDC_User>} */ users: Map<string, SFDC_User> = data.get(DatasetAliases.INTERNALACTIVEUSERS);
        const /** @type {Map<string, SFDC_Profile>} */ profiles: Map<string, SFDC_Profile> = data.get(DatasetAliases.PROFILES);
        const /** @type {Map<string, SFDC_PermissionSet>} */ permissionSets: Map<string, SFDC_PermissionSet> = data.get(DatasetAliases.PERMISSIONSETS);

        // Checking data
        if (!users) throw new Error(`RecipeActiveUsers: Data from dataset alias 'INTERNALACTIVEUSERS' was undefined.`);
        if (!profiles) throw new Error(`RecipeActiveUsers: Data from dataset alias 'PROFILES' was undefined.`);
        if (!permissionSets) throw new Error(`RecipeActiveUsers: Data from dataset alias 'PERMISSIONSETS' was undefined.`);

        // Augment data
        await Processor.forEach(users, async (/** @type {SFDC_User} */ user: SFDC_User) => {
            const profileRef = profiles.get(user.profileId);
            if (profileRef) {
                user.profileRef = profileRef;
            }
            user.permissionSetRefs = await Processor.map(
                user.permissionSetIds,
                (/** @type {string} */ id: string) => permissionSets.get(id),
                (/** @type {string} */ id: string) => permissionSets.has(id)
            );
            user.importantPermissionsGrantedBy = {
                apiEnabled: [],
                viewSetup: [],
                modifyAllData: [], 
                viewAllData: [],
                manageUsers: [], 
                customizeApplication: []
            };
            if (user.profileRef?.importantPermissions) {
                Object.keys(user.profileRef.importantPermissions)
                    .filter((permName) => user.profileRef.importantPermissions[permName] === true)
                    .forEach((permName) => user.importantPermissionsGrantedBy[permName].push(user.profileRef));
            }
            await Processor.forEach(user.permissionSetRefs, async (/** @type {SFDC_PermissionSet} */ permissionSet: SFDC_PermissionSet) => {
                Object.keys(permissionSet.importantPermissions)
                    .filter((permName) => permissionSet.importantPermissions[permName] === true)
                    .forEach((permName) => user.importantPermissionsGrantedBy[permName].push(permissionSet));
            });
            user.importantPermissions = {
                apiEnabled: user.importantPermissionsGrantedBy.apiEnabled?.length > 0,
                viewSetup: user.importantPermissionsGrantedBy.viewSetup?.length > 0,
                modifyAllData: user.importantPermissionsGrantedBy.modifyAllData?.length > 0,
                viewAllData: user.importantPermissionsGrantedBy.viewAllData?.length > 0,
                manageUsers: user.importantPermissionsGrantedBy.manageUsers?.length > 0,
                customizeApplication: user.importantPermissionsGrantedBy.customizeApplication?.length > 0
            };
        });
        // Return data
        return [... users.values()];
    }
}