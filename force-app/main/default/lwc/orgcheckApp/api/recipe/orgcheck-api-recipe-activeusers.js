import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { DATASET_USERS_ALIAS, 
    DATASET_PROFILES_ALIAS, 
    DATASET_PERMISSIONSETS_ALIAS } from '../core/orgcheck-api-datasetmanager';

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
    transform(data) {
        // Get data
        const users = data.get(DATASET_USERS_ALIAS);
        const profiles = data.get(DATASET_PROFILES_ALIAS);
        const permissionSets = data.get(DATASET_PERMISSIONSETS_ALIAS);
        // Augment data
        users.forEach((user) => {
            user.profileRef = profiles.get(user.profileId);
            user.permissionSetRefs = user.permissionSetIds.filter((id) => permissionSets.has(id)).map((id) => permissionSets.get(id));
        });
        // Return all data
        return [... users.values()];
    }
}