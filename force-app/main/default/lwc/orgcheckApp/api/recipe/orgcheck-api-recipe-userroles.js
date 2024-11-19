import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { DATASET_USERROLES_ALIAS,
    DATASET_USERS_ALIAS } from '../core/orgcheck-api-datasetmanager';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';

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
    async transform(data, includesExternalRoles=false) {
        // Get data
        const userRoles = data.get(DATASET_USERROLES_ALIAS);
        const users = data.get(DATASET_USERS_ALIAS);
        // Augment data
        await OrgCheckProcessor.forEach(userRoles, async (userRole) => {
            if (userRole.hasActiveMembers === true) {
                userRole.activeMemberRefs = await OrgCheckProcessor.map(userRole.activeMemberIds, (id) => users.get(id));
            }
            if (userRole.hasParent === true) {
                userRole.parentRef = userRoles.get(userRole.parentId);
            }
        });

        // Filter data
        const array = [];
        if (includesExternalRoles === true) {
            // in this case do not filter!
            await OrgCheckProcessor.forEach(userRoles, (userRole) => {
                array.push(userRole);
            });
        } else {
            // in this case please filter
            await OrgCheckProcessor.forEach(userRoles, (userRole) => {
                if (userRole.isExternal === false) array.push(userRole);
            });
        }
        // Return data
        return array;
    }
}