import { Recipe } from '../core/orgcheck-api-recipe';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { DatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { Data, DataWithoutScoring } from '../core/orgcheck-api-data';
import { DataMatrix } from '../core/orgcheck-api-data-matrix';

export class RecipeCurrentUserPermissions extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfos) that this recipe is using
     * @param {SimpleLoggerIntf} _logger - Logger
     * @param {Map<string, any>} [parameters] - List of optional argument to pass
     * @returns {Array<string | DatasetRunInformation>} The datasets aliases that this recipe is using
     * @public
     */
    extract(_logger, parameters) {
        return [
            new DatasetRunInformation(
                DatasetAliases.CURRENTUSERPERMISSIONS,
                DatasetAliases.CURRENTUSERPERMISSIONS,
                parameters // should include 'permissions'
            )
        ];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map<string, any>} data - Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map<string, any>>} Returns as it is the value returned by the transform method recipe.
     * @async
     * @public
     */
    async transform(data, _logger) {

        // Get data
        const /** @type {Map<string, boolean>} */ currentUserPermissions = data.get(DatasetAliases.CURRENTUSERPERMISSIONS);
        
        // Checking data
        if (!currentUserPermissions) throw new Error(`RecipeCurrentUserPermissions: Data from dataset alias 'CURRENTUSERPERMISSIONS' was undefined.`);

        // Return all data
        return currentUserPermissions;
    }
}