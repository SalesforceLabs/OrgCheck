import { Recipe } from '../core/orgcheck-api-recipe';
import { Processor } from '../core/orgcheck-api-processor';
import { Data } from '../core/orgcheck-api-data';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { DatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { SFDC_Flow } from '../data/orgcheck-api-data-flow';
import { DataMatrix } from '../core/orgcheck-api-data-matrix';

export class RecipeFlows implements Recipe {

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
     * @returns {Promise<Array<Data> | DataMatrix | Data | Map<string, any>>} Returns as it is the value returned by the transform method recipe.
     * @async
     * @public
     */
    async transform(data: Map<string, any>, _logger: SimpleLoggerIntf): Promise<Array<Data> | DataMatrix | Data | Map<string, any>> {

        // Get data
        const /** @type {Map<string, SFDC_Flow>} */ flows: Map<string, SFDC_Flow> = data.get(DatasetAliases.FLOWS);

        // Checking data and filter
        if (!flows) throw new Error(`RecipeFlows: Data from dataset alias 'FLOWS' was undefined.`);

        // Filter data
        /** @type {Array<SFDC_Flow>} */
        const array: Array<SFDC_Flow> = [];
        await Processor.forEach(flows, async (/** @type {SFDC_Flow} */ flow: SFDC_Flow) => {
            if (flow.isProcessBuilder === false) {
                array.push(flow);
            }
        });

        // Return data
        return array;
    }
}