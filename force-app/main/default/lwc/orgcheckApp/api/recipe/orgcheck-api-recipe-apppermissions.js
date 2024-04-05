import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { DATASET_APPPERMISSIONS_ALIAS,
    DATASET_PROFILES_ALIAS,
    DATASET_PERMISSIONSETS_ALIAS } from '../core/orgcheck-api-datasetmanager';

export class OrgCheckRecipeAppPermissions extends OrgCheckRecipe {

    /** 
     * Return the list of dataset you need 
     * 
     * @returns {Array<string>}
     */
    extract() {
        return [
            DATASET_APPPERMISSIONS_ALIAS,
            DATASET_PROFILES_ALIAS,
            DATASET_PERMISSIONSETS_ALIAS
        ];
    }

    /**
     * Get a list of object permissions per parent (async method)
     * 
     * @param {Map} data extracted
     * @param {string} namespace you want to list (optional), '*' for any
     * 
     * @returns {Any} with objects property as Array<string> and permissions property as Array<SFDC_AppPermissionsPerParent>}
     */
    transform(data, namespace) {
        // Get data
        const permissions = data.get(DATASET_APPPERMISSIONS_ALIAS);
        const profiles = data.get(DATASET_PROFILES_ALIAS);
        const permissionSets = data.get(DATASET_PERMISSIONSETS_ALIAS);

        // Augment data
        permissions.forEach((permission) => {
            if (permission.isParentProfile === true) {
                permission.parentRef = profiles.get(permission.parentId);
            } else {
                permission.parentRef = permissionSets.get(permission.parentId);
            }
        });

        // Filter data
        const permissionsBy = new Map();
        const properties = new Set();
        permissions.forEach((permission) => {
            if (namespace === '*' || permission.parentRef.package === namespace) {
                if (permissionsBy.has(permission.parentId) === false) {
                    permissionsBy.set(permission.parentId, {
                        parentRef: permission.parentRef,
                        appPermissions: {}
                    });
                }
                permissionsBy.get(permission.parentId).appPermissions[permission.appName] =
                    (permission.isAccessible?'A':'') +
                    (permission.isVisible?'V':'');
                properties.add(permission.appName);
            }
        });

        // Return data
        return { apps: Array.from(properties), permissionsBy: Array.from(permissionsBy.values())};
    }
}