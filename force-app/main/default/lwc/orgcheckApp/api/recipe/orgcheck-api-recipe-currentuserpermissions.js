import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { DatasetRunInformation,
    DATASET_CURRENTUSERPERMISSIONS_ALIAS } from '../core/orgcheck-api-datasetmanager';

export class OrgCheckRecipeCurrentUserPermissions extends OrgCheckRecipe {

    /** 
     * Return the list of dataset you need 
     * 
     * @returns {Array<string>}
     */
    extract(permissions) {
        const datasetRunInfo = new DatasetRunInformation(DATASET_CURRENTUSERPERMISSIONS_ALIAS, DATASET_CURRENTUSERPERMISSIONS_ALIAS);
        datasetRunInfo.parameters.set('permissions', permissions);
        return [datasetRunInfo];
    }

    /**
     * Get the information of the current user permissions (async method)
     * 
     * @param {Map} data extracted
     * 
     * @returns {Map} List of booleans identified by the name of the permission
     */
    async transform(data) {
        // Get data
        const currentUserPermissions = data.get(DATASET_CURRENTUSERPERMISSIONS_ALIAS);
        
        // Return all data
        return currentUserPermissions;
    }
}