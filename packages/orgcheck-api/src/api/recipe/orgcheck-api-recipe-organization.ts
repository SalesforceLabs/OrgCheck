import { Recipe } from 'src/api/core/orgcheck-api-recipe';
import { Data } from 'src/api/core/orgcheck-api-data';
import { DataMatrixIntf } from 'src/api/core/orgcheck-api-data-matrix';
import { SimpleLoggerIntf } from 'src/api/core/orgcheck-api-logger';
import { DatasetRunInformation } from 'src/api/core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from 'src/api/core/orgcheck-api-datasets-aliases';
import { SfdcOrganization }from 'src/api/data/orgcheck-api-data-organization';

export class RecipeOrganization implements Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfos) that this recipe is using
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Array<string | DatasetRunInformation>} The datasets aliases that this recipe is using
     * @public
     */
    extract(_logger: SimpleLoggerIntf): Array<string | DatasetRunInformation> {
        return [DatasetAliases.ORGANIZATION];
    }

    /**
     * @description transform the data from the datasets and return the final result as an Array
     * @param {Map<string, any>} data - Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Promise<Array<Data> | DataMatrixIntf | Data | Map<string, any>>} Returns as it is the value returned by the transform method recipe.
     * @async
     * @public
     */
    async transform(data: Map<string, any>, _logger: SimpleLoggerIntf): Promise<Array<Data> | DataMatrixIntf | Data | Map<string, any>> {

        // Get data
        const /** @type {Map<string, SfdcOrganization>} */ organization: Map<string, SfdcOrganization> = data.get(DatasetAliases.ORGANIZATION);

        // Checking data
        if (!organization) throw new Error(`RecipeOrganization: Data from dataset alias 'ORGANIZATION' was undefined.`);

        // Return data
        return organization;
    }
}