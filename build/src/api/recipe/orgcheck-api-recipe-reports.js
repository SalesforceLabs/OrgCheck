import { Recipe } from '../core/orgcheck-api-recipe';
import { Data, DataWithoutScoring } from '../core/orgcheck-api-data';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { DatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { SFDC_User } from '../data/orgcheck-api-data-user';
import { DataMatrix } from '../core/orgcheck-api-data-matrix';
import { SFDC_Report } from '../data/orgcheck-api-data-report';

export class RecipeReports extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfos) that this recipe is using
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Array<string | DatasetRunInformation>} The datasets aliases that this recipe is using
     * @public
     */
    extract(_logger) {
        return [DatasetAliases.INTERNALACTIVEUSERS, DatasetAliases.REPORTS];
    }

    /**
     * @description transform the data from the datasets and return the final result as an Array
     * @param {Map<string, any>} data - Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map<string, any>>} Returns as it is the value returned by the transform method recipe.
     * @async
     * @public
     */
    async transform(data, _logger) {

        // Get data
        const /** @type {Map<string, SFDC_Report>} */ reports = data.get(DatasetAliases.REPORTS);
        const /** @type {Map<string, SFDC_User>} */ users = data.get(DatasetAliases.INTERNALACTIVEUSERS);

        // Checking data
        if (!reports) throw new Error(`RecipeReports: Data from dataset alias 'REPORTS' was undefined.`);
        if (!users) throw new Error(`RecipeReports: Data from dataset alias 'INTERNALACTIVEUSERS' was undefined.`);

        // Return data
        return [... reports.values()];
    }
}