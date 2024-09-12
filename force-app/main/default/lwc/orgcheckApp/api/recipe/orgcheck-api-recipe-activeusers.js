import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { DATASET_USERS_ALIAS, 
    DATASET_PROFILES_ALIAS, 
    DATASET_PERMISSIONSETS_ALIAS } from '../core/orgcheck-api-datasetmanager';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';

export class OrgCheckRecipeActiveUsers extends OrgCheckRecipe {

    /** 
     * Return the list of dataset you need 
     * 
     * @returns {Array<string>}
     */
    extract() {
        return [
            DATASET_USERS_ALIAS, 
            DATASET_PROFILES_ALIAS, 
            DATASET_PERMISSIONSETS_ALIAS
        ];
    }

    /**
     * Get a list of active users (async method)
     * 
     * @param {Map} data extracted
     * 
     * @returns {Array<SFDC_User>}
     */
    async transform(data) {
        // Get data
        const users = data.get(DATASET_USERS_ALIAS);
        const profiles = data.get(DATASET_PROFILES_ALIAS);
        const permissionSets = data.get(DATASET_PERMISSIONSETS_ALIAS);
        // Augment data
        await OrgCheckProcessor.chaque(users, async (user) => {
            user.profileRef = profiles.get(user.profileId);
            user.permissionSetRefs = await OrgCheckProcessor.carte(
                await OrgCheckProcessor.filtre(user.permissionSetIds, (id) => permissionSets.has(id)),
                (id) => permissionSets.get(id)
            );
            user.aggregateImportantPermissions = {};
            if (user.profileRef?.importantPermissions) {
                Object.keys(user.profileRef.importantPermissions)
                    .filter(permName => user.profileRef.importantPermissions[permName] === true)
                    .forEach(permName => { user.aggregateImportantPermissions[permName] = [ user.profileRef ]; });
            }
            await OrgCheckProcessor.chaque(user.permissionSetRefs, (permissionSet) => {
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