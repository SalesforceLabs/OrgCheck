import { Recipe } from 'src/api/core/orgcheck-api-recipe';
import { Processor } from 'src/api/core/orgcheck-api-processor';
import { SimpleLoggerIntf } from 'src/api/core/orgcheck-api-logger';
import { DatasetRunInformation } from 'src/api/core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from 'src/api/core/orgcheck-api-datasets-aliases';
import { SfdcFlow }from 'src/api/data/orgcheck-api-data-flow';

export class RecipeProcessBuilders implements Recipe<SfdcFlow[]> {

    /**
     * @description List all dataset aliases (or datasetRunInfos) that this recipe is using
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Array<string | DatasetRunInformation>} The datasets aliases that this recipe is using
     * @public
     */
    extract(_logger: SimpleLoggerIntf): Array<string | DatasetRunInformation> {
        return [DatasetAliases.FLOWS];
    }

    /**
     * @description transform the data from the datasets and return the final result as an Array
     * @param {Map<string, any>} data - Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Promise<SfdcFlow[]>} Returns as it is the value returned by the transform method recipe.
     * @async
     * @public
     */
    async transform(data: Map<string, any>, _logger: SimpleLoggerIntf): Promise<SfdcFlow[]> {

        // Get data
        const flows: Map<string, SfdcFlow> = data.get(DatasetAliases.FLOWS);

        // Checking data
        if (!flows) throw new Error(`RecipeProcessBuilders: Data from dataset alias 'FLOWS' was undefined.`);

        // Filter data
        const array: Array<SfdcFlow> = [];
        await Processor.forEach(flows, async (flow: SfdcFlow) => {
            if (flow.isProcessBuilder === true) {
                array.push(flow);
            }
        });

        // Return data
        return array;
    }
}