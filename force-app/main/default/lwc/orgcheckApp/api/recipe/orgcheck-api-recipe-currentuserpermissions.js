import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { OrgCheckData, OrgCheckDataWithoutScoring } from '../core/orgcheck-api-data';
import { OrgCheckDataMatrix } from '../core/orgcheck-api-data-matrix';
import { OrgCheckSimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { OrgCheckDatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { OrgCheckDatasetAliases } from '../core/orgcheck-api-datasets-aliases';

export class OrgCheckRecipeCurrentUserPermissions extends OrgCheckRecipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {OrgCheckSimpleLoggerIntf} logger
     * @param {Array<string>} permissions List of string to represent the permission you need to retreive
     * @returns {Array<string | OrgCheckDatasetRunInformation>}
     * @public
     */
    extract(logger, permissions) {
        const datasetRunInfo = new OrgCheckDatasetRunInformation(OrgCheckDatasetAliases.CURRENTUSERPERMISSIONS, OrgCheckDatasetAliases.CURRENTUSERPERMISSIONS);
        datasetRunInfo.parameters.set('permissions', permissions);
        return [datasetRunInfo];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {OrgCheckSimpleLoggerIntf} logger
     * @returns {Promise<Map<string, boolean>>}
     * @async
     * @public
     */
    async transform(data, logger) {

        // Get data
        const /** @type {Map<string, boolean>} */ currentUserPermissions = data.get(OrgCheckDatasetAliases.CURRENTUSERPERMISSIONS);
        
        // Checking data
        if (!currentUserPermissions) throw new Error(`Data from dataset alias 'CURRENTUSERPERMISSIONS' was undefined.`);

        // Return all data
        return currentUserPermissions;
    }
}