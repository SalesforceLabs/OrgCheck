// @ts-check

import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { OrgCheckDatasetAliases, OrgCheckDatasetRunInformation } from '../core/orgcheck-api-datasetmanager';
import { OrgCheckData } from '../core/orgcheck-api-data';
import { OrgCheckMatrixData } from '../core/orgcheck-api-data-matrix';

export class OrgCheckRecipeCurrentUserPermissions extends OrgCheckRecipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {Array<string>} permissions List of string to represent the permission you need to retreive
     * @returns {Array<string | OrgCheckDatasetRunInformation>}
     * @public
     */
    extract(permissions) {
        const datasetRunInfo = new OrgCheckDatasetRunInformation(OrgCheckDatasetAliases.CURRENTUSERPERMISSIONS, OrgCheckDatasetAliases.CURRENTUSERPERMISSIONS);
        datasetRunInfo.parameters.set('permissions', permissions);
        return [datasetRunInfo];
    }

    /**
     * @description transform the data from the datasets and return the final result as an Array
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @returns {Promise<Array<OrgCheckData> | OrgCheckMatrixData | OrgCheckData | Map>}
     * @async
     * @public
     */
    async transform(data) {
        // Get data
        const currentUserPermissions = data.get(OrgCheckDatasetAliases.CURRENTUSERPERMISSIONS);
        
        // Return all data
        return currentUserPermissions;
    }
}