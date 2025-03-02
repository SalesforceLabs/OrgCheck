import { Recipe } from '../core/orgcheck-api-recipe';
import { Processor } from '../core/orgcheck-api-processing';
import { Data, DataWithoutScoring } from '../core/orgcheck-api-data';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { DatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { SFDC_Flow } from '../data/orgcheck-api-data-flow';
import { DataMatrix } from '../core/orgcheck-api-data-matrix';

export class RecipeFlows extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {SimpleLoggerIntf} logger
     * @returns {Array<string | DatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [DatasetAliases.FLOWS];
    }

    /**
     * @description transform the data from the datasets and return the final result as an Array
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger) {

        // Get data
        const /** @type {Map<string, SFDC_Flow>} */ flows = data.get(DatasetAliases.FLOWS);

        // Checking data
        if (!flows) throw new Error(`Data from dataset alias 'FLOWS' was undefined.`);

        // Filter data
        const array = [];
        await Processor.forEach(flows, (flow) => {
            if (flow.type !== 'Workflow') {
                array.push(flow);
            }
        });

        // Return data
        return array;
    }
}