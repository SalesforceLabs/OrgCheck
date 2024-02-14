import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { DATASET_OBJECTPERMISSIONS_ALIAS,
    DATASET_PROFILES_ALIAS,
    DATASET_PERMISSIONSETS_ALIAS } from '../core/orgcheck-api-datasetmanager';

export class OrgCheckRecipeObjectPermissions extends OrgCheckRecipe {

    /** 
     * Return the list of dataset you need 
     * 
     * @returns {Array<string>}
     */
    extract() {
        return [
            DATASET_OBJECTPERMISSIONS_ALIAS,
            DATASET_PROFILES_ALIAS,
            DATASET_PERMISSIONSETS_ALIAS
        ];
    }

    /**
     * Get a list of object permissions (async method)
     * 
     * @param {Map} data extracted
     * @param {string} namespace you want to list (optional), '*' for any
     * 
     * @returns {Array<SFDC_ObjectPermission>}
     */
    transform(data, namespace) {
        // Get data
        const permissions = data.get(DATASET_OBJECTPERMISSIONS_ALIAS);
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
        const array = [];
        for (const permission of permissions.values()) {
            if (namespace === '*' || permission.parentRef.package === namespace) {
                array.push(permission);
            }
        }
        // Return data
        return array;
    }
}