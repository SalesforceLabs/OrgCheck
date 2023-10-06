import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { DATASET_PERMISSIONSETS_ALIAS, 
    DATASET_PROFILES_ALIAS } from '../core/orgcheck-api-datasetmanager';

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
     * @param {OrgCheckMap} data extracted
     * @param {string} namespace you want to list (optional), '*' for any
     * 
     * @returns {Array<SFDC_PermissionSet>}
     */
    transform(data, namespace) {
        const permissionSets = data.get(DATASET_PERMISSIONSETS_ALIAS);
        const profiles = data.get(DATASET_PROFILES_ALIAS);
        permissionSets.forEachValue((permissionSet) => {
            permissionSet.profileRefs = permissionSet.profileIds.filter((id) => profiles.hasKey(id)).map((id) => profiles.get(id));
        });
        return permissionSets.filterValues((permissionSet) => {
            if (namespace !== '*' && permissionSet.package !== namespace) return false;
            return true;
        });
    }
}