import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { DATASET_CURRENTUSERPERMISSIONS_ALIAS } from '../core/orgcheck-api-datasetmanager';

export class OrgCheckRecipeCurrentUserPermissions extends OrgCheckRecipe {

    /** 
     * Return the list of dataset you need 
     * 
     * @returns {Array<string>}
     */
    extract() {
        return [DATASET_CURRENTUSERPERMISSIONS_ALIAS];
    }

    /**
     * Get the information of the current user permissions (async method)
     * 
     * @param {Map} data extracted
     * 
     * @returns {Map} List of booleans identified by the name of the permission
     */
    transform(data) {
        // Get data
        const currentUserPermissions = data.get(DATASET_CURRENTUSERPERMISSIONS_ALIAS);
        
        // Return all data
        return currentUserPermissions;
    }
}