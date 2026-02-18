import { Recipe } from '../core/orgcheck-api-recipe';
import { Data, DataWithoutScore } from '../core/orgcheck-api-data';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { DatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { SFDC_Browser } from '../data/orgcheck-api-data-browser';
import { DataMatrix } from '../core/orgcheck-api-data-matrix';

export class RecipeBrowsers implements Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfos) that this recipe is using
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Array<string | DatasetRunInformation>} The datasets aliases that this recipe is using
     * @public
     */
    extract(_logger: SimpleLoggerIntf): Array<string | DatasetRunInformation> {
        return [DatasetAliases.BROWSERS];
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

        // Get data and parameters
        const /** @type {Map<string, SFDC_Browser>} */ browsers: Map<string, SFDC_Browser> = data.get(DatasetAliases.BROWSERS);

        // Checking data
        if (!browsers) throw new Error(`RecipeBrowsers: Data from dataset alias 'BROWSERS' was undefined.`);

        // Return all data
        return [... browsers.values()];
    }
}