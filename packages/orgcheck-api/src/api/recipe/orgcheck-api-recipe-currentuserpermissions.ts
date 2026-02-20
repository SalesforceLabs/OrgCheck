import { Recipe } from '../core/orgcheck-api-recipe';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { DatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { Data } from '../core/orgcheck-api-data';
import { DataMatrix } from '../core/orgcheck-api-data-matrix';

export class RecipeCurrentUserPermissions implements Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfos) that this recipe is using
     * @param {SimpleLoggerIntf} _logger - Logger
     * @param {Map<string, any>} [parameters] - List of optional argument to pass
     * @returns {Array<string | DatasetRunInformation>} The datasets aliases that this recipe is using
     * @public
     */
    extract(_logger: SimpleLoggerIntf, parameters: Map<string, any>): Array<string | DatasetRunInformation> {
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
     * @returns {Promise<Array<Data> | DataMatrix | Data | Map<string, any>>} Returns as it is the value returned by the transform method recipe.
     * @async
     * @public
     */
    async transform(data: Map<string, any>, _logger: SimpleLoggerIntf): Promise<Array<Data> | DataMatrix | Data | Map<string, any>> {

        // Get data
        const /** @type {Map<string, boolean>} */ currentUserPermissions: Map<string, boolean> = data.get(DatasetAliases.CURRENTUSERPERMISSIONS);
        
        // Checking data
        if (!currentUserPermissions) throw new Error(`RecipeCurrentUserPermissions: Data from dataset alias 'CURRENTUSERPERMISSIONS' was undefined.`);

        // Return all data
        return currentUserPermissions;
    }
}