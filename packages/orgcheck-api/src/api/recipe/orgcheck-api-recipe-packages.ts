import { Recipe } from 'src/api/core/orgcheck-api-recipe';
import { SimpleLoggerIntf } from 'src/api/core/orgcheck-api-logger';
import { DatasetRunInformation } from 'src/api/core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from 'src/api/core/orgcheck-api-datasets-aliases';
import { SfdcPackage }from 'src/api/data/orgcheck-api-data-package';

export class RecipePackages implements Recipe<SfdcPackage[]> {

    /**
     * @description List all dataset aliases (or datasetRunInfos) that this recipe is using
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Array<string | DatasetRunInformation>} The datasets aliases that this recipe is using
     * @public
     */
    extract(_logger: SimpleLoggerIntf): Array<string | DatasetRunInformation> {
        return [ DatasetAliases.PACKAGES ];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map<string, any>} data - Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Promise<SfdcPackage[]>} Returns as it is the value returned by the transform method recipe.
     * @async
     * @public
     */
    async transform(data: Map<string, any>, _logger: SimpleLoggerIntf): Promise<SfdcPackage[]> {

        // Get data
        const packages: Map<string, SfdcPackage> = data.get(DatasetAliases.PACKAGES);

        // Checking data
        if (!packages) throw new Error(`RecipePackages: Data from dataset alias 'PACKAGES' was undefined.`);

        // Return data
        return [... packages.values()];
    }
}