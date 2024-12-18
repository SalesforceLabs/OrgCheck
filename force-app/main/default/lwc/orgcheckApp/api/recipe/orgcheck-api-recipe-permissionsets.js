import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { DATASET_PERMISSIONSETS_ALIAS, 
    DATASET_PROFILES_ALIAS } from '../core/orgcheck-api-datasetmanager';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';

export class OrgCheckRecipePermissionSets extends OrgCheckRecipe {

    /** 
     * Return the list of dataset you need 
     * 
     * @returns {Array<string>}
     */
    extract() {
        return [
            DATASET_PERMISSIONSETS_ALIAS, 
            DATASET_PROFILES_ALIAS
        ];
    }

    /**
     * Get a list of permission sets (async method)
     * 
     * @param {Map} data extracted
     * @param {string} namespace you want to list (optional), '*' for any
     * 
     * @returns {Array<SFDC_PermissionSet>}
     */
    async transform(data, namespace) {
        // Get data
        const permissionSets = data.get(DATASET_PERMISSIONSETS_ALIAS);
        const profiles = data.get(DATASET_PROFILES_ALIAS);
        // Augment data
        await OrgCheckProcessor.forEach(permissionSets, async (permissionSet) => {
            permissionSet.assigneeProfileRefs = await OrgCheckProcessor.map(
                permissionSet.assigneeProfileIds,
                (id) => profiles.get(id),
                (id) => profiles.has(id)
            );
        });
        // Filter data
        const array = [];
        await OrgCheckProcessor.forEach(permissionSets, (permissionSet) => {
            if (namespace === '*' || permissionSet.package === namespace) {
                array.push(permissionSet);
            }
        });
        // Return data
        return array;
    }
}