import { Recipe } from 'src/api/core/orgcheck-api-recipe';
import { SimpleLoggerIntf } from 'src/api/core/orgcheck-api-logger';
import { DatasetRunInformation } from 'src/api/core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from 'src/api/core/orgcheck-api-datasets-aliases';
import { SfdcProfilePasswordPolicy }from 'src/api/data/orgcheck-api-data-profilepasswordpolicy';

export class RecipeProfilePasswordPolicies implements Recipe<SfdcProfilePasswordPolicy[]> {

    /**
     * @description List all dataset aliases (or datasetRunInfos) that this recipe is using
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Array<string | DatasetRunInformation>} The datasets aliases that this recipe is using
     * @public
     */
    extract(_logger: SimpleLoggerIntf): Array<string | DatasetRunInformation> {
        return [ DatasetAliases.PROFILEPWDPOLICIES ];
    }

    /**
     * @description transform the data from the datasets and return the final result as an Array
     * @param {Map<string, any>} data - Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Promise<SfdcProfilePasswordPolicy[]>} Returns as it is the value returned by the transform method recipe.
     * @async
     * @public
     */
    async transform(data: Map<string, any>, _logger: SimpleLoggerIntf): Promise<SfdcProfilePasswordPolicy[]> {

        // Get data
        const policies: Map<string, SfdcProfilePasswordPolicy> = data.get(DatasetAliases.PROFILEPWDPOLICIES);

        // Checking data
        if (!policies) throw new Error(`RecipeProfilePasswordPolicies: Data from dataset alias 'PROFILEPWDPOLICIES' was undefined.`);

        // Return all data
        return [... policies.values()];
    }
}