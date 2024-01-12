import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { DATASET_USERROLES_ALIAS,
    DATASET_USERS_ALIAS } from '../core/orgcheck-api-datasetmanager';

export class OrgCheckRecipeUserRoles extends OrgCheckRecipe {

    /** 
     * Return the list of dataset you need 
     * 
     * @returns {Array<string>}
     */
    extract() {
        return [
            DATASET_USERROLES_ALIAS, 
            DATASET_USERS_ALIAS
        ];
    }

    /**
     * Get a list of custom fields (async method)
     * 
     * @param {Map} data extracted
     * @param {boolean} do you want to include the external roles? (false by default)
     * 
     * @returns {Array<SFDC_UserRole>}
     */
    transform(data, includesExternalRoles=false) {
        // Get data
        const userRoles = data.get(DATASET_USERROLES_ALIAS);
        const users = data.get(DATASET_USERS_ALIAS);
        // Augment data
        userRoles.forEach((userRole) => {
            if (userRole.hasActiveMembers === true) {
                userRole.activeMemberRefs = userRole.activeMemberIds.map((id) => users.get(id));
            }
            if (userRole.hasParent === true) {
                userRole.parentRef = userRoles.get(userRole.parentId);
            }
        });

        // Filter data
        const array = [];
        if (includesExternalRoles === true) {
            // in this case do not filter!
            for (const userRole of userRoles.values()) {
                array.push(userRole);
            }
        } else {
            // in this case please filter
            for (const userRole of userRoles.values()) {
                if (userRole.isExternal === false) array.push(userRole);
            }
        }
        // Return data
        return array;
    }
}