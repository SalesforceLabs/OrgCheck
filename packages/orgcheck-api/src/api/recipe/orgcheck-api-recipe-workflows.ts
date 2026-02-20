import { Recipe } from '../core/orgcheck-api-recipe';
import { Data } from '../core/orgcheck-api-data';
import { DataMatrix } from '../core/orgcheck-api-data-matrix';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { DatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { SFDC_Workflow } from '../data/orgcheck-api-data-workflow';

export class RecipeWorkflows implements Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfos) that this recipe is using
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Array<string | DatasetRunInformation>} The datasets aliases that this recipe is using
     * @public
     */
    extract(_logger: SimpleLoggerIntf): Array<string | DatasetRunInformation> {
        return [DatasetAliases.WORKFLOWS];
    }

    /**
     * @description transform the data from the datasets and return the final result as an Array
     * @param {Map<string, any>} data - Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Promise<Array<Data> | DataMatrix | Data | Map<string, any>>} Returns as it is the value returned by the transform method recipe.
     * @async
     * @public
     */
    async transform(data: Map<string, any>, _logger: SimpleLoggerIntf): Promise<Array<Data> | DataMatrix | Data | Map<string, any>> {

        // Get data
        const /** @type {Map<string, SFDC_Workflow>} */ workflows: Map<string, SFDC_Workflow> = data.get(DatasetAliases.WORKFLOWS);

        // Checking data
        if (!workflows) throw new Error(`RecipeWorkflows: Data from dataset alias 'WORKFLOWS' was undefined.`);

        // Return data
        return [... workflows.values()];
    }
}