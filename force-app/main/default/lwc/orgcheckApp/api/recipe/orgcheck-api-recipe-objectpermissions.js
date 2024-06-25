import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { DATASET_OBJECTPERMISSIONS_ALIAS,
    DATASET_PROFILES_ALIAS,
    DATASET_PERMISSIONSETS_ALIAS } from '../core/orgcheck-api-datasetmanager';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';

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
     * Get a list of object permissions per parent (async method)
     * 
     * @param {Map} data extracted
     * @param {string} namespace you want to list (optional), '*' for any
     * 
     * @returns {Any} with objects property as Array<string> and permissions property as Array<SFDC_ObjectPermissionsPerParent>}
     */
    async transform(data, namespace) {
        // Get data
        const permissions = data.get(DATASET_OBJECTPERMISSIONS_ALIAS);
        const profiles = data.get(DATASET_PROFILES_ALIAS);
        const permissionSets = data.get(DATASET_PERMISSIONSETS_ALIAS);

        // Augment data
        await OrgCheckProcessor.chaque(permissions, (permission) => {
            if (permission.isParentProfile === true) {
                permission.parentRef = profiles.get(permission.parentId);
            } else {
                permission.parentRef = permissionSets.get(permission.parentId);
            }
        });

        // Filter data
        const permissionsBy = new Map();
        const properties = new Set();
        await OrgCheckProcessor.chaque(permissions, (permission) => {
            if (namespace === '*' || permission.parentRef.package === namespace) {
                if (permissionsBy.has(permission.parentId) === false) {
                    permissionsBy.set(permission.parentId, {
                        parentRef: permission.parentRef,
                        objectPermissions: {}
                    });
                }
                permissionsBy.get(permission.parentId).objectPermissions[permission.objectType] = 
                    (permission.isCreate?'C':'') +
                    (permission.isRead?'R':'') +
                    (permission.isEdit?'U':'') + 
                    (permission.isDelete?'D':'') + 
                    (permission.isViewAll?'v':'') + 
                    (permission.isModifyAll?'m':'');
                properties.add(permission.objectType);
            }
        });

        // Return data
        return { objects: Array.from(properties), permissionsBy: Array.from(permissionsBy.values())};
    }
}