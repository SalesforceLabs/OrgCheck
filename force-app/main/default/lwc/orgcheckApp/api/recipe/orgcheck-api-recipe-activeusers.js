// @ts-check

import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { OrgCheckDatasetAliases, OrgCheckDatasetRunInformation } from '../core/orgcheck-api-datasetmanager';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';
import { OrgCheckData } from '../core/orgcheck-api-data';
import { OrgCheckMatrixData } from '../core/orgcheck-api-data-matrix';

export class OrgCheckRecipeActiveUsers extends OrgCheckRecipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @returns {Array<string | OrgCheckDatasetRunInformation>}
     * @public
     */
    extract() {
        return [
            OrgCheckDatasetAliases.USERS, 
            OrgCheckDatasetAliases.PROFILES, 
            OrgCheckDatasetAliases.PERMISSIONSETS
        ];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @returns {Promise<Array<OrgCheckData> | OrgCheckMatrixData | OrgCheckData | Map>}
     * @async
     * @public
     */
    async transform(data) {
        // Get data
        const users = data.get(OrgCheckDatasetAliases.USERS);
        const profiles = data.get(OrgCheckDatasetAliases.PROFILES);
        const permissionSets = data.get(OrgCheckDatasetAliases.PERMISSIONSETS);
        // Augment data
        await OrgCheckProcessor.forEach(users, async (user) => {
            user.profileRef = profiles.get(user.profileId);
            user.permissionSetRefs = await OrgCheckProcessor.map(
                user.permissionSetIds,
                (id) => permissionSets.get(id),
                (id) => permissionSets.has(id)
            );
            user.aggregateImportantPermissions = {};
            if (user.profileRef?.importantPermissions) {
                Object.keys(user.profileRef.importantPermissions)
                    .filter(permName => user.profileRef.importantPermissions[permName] === true)
                    .forEach(permName => { user.aggregateImportantPermissions[permName] = [ user.profileRef ]; });
            }
            await OrgCheckProcessor.forEach(user.permissionSetRefs, (permissionSet) => {
                Object.keys(permissionSet.importantPermissions)
                    .filter(permName => permissionSet.importantPermissions[permName] === true)
                    .forEach(permName => { 
                        if (!user.aggregateImportantPermissions[permName]) user.aggregateImportantPermissions[permName] = []; 
                        user.aggregateImportantPermissions[permName].push(permissionSet);
                    });
            });
        });
        // Return all data
        return [... users.values()];
    }
}