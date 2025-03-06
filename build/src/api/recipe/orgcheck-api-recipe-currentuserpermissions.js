import { Recipe } from '../core/orgcheck-api-recipe';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { DatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { Data, DataWithoutScoring } from '../core/orgcheck-api-data';
import { DataMatrix } from '../core/orgcheck-api-data-matrix';

export class RecipeCurrentUserPermissions extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {SimpleLoggerIntf} logger
     * @param {Array<string>} permissions List of string to represent the permission you need to retreive
     * @returns {Array<string | DatasetRunInformation>}
     * @public
     */
    extract(logger, permissions) {
        const datasetRunInfo = new DatasetRunInformation(DatasetAliases.CURRENTUSERPERMISSIONS, DatasetAliases.CURRENTUSERPERMISSIONS);
        datasetRunInfo.parameters.set('permissions', permissions);
        return [datasetRunInfo];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger) {

        // Get data
        const /** @type {Map<string, boolean>} */ currentUserPermissions = data.get(DatasetAliases.CURRENTUSERPERMISSIONS);
        
        // Checking data
        if (!currentUserPermissions) throw new Error(`RecipeCurrentUserPermissions: Data from dataset alias 'CURRENTUSERPERMISSIONS' was undefined.`);

        // Return all data
        return currentUserPermissions;
    }
}