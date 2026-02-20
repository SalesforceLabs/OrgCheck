import { Recipe } from '../core/orgcheck-api-recipe';
import { Data } from '../core/orgcheck-api-data';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { DatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { SFDC_User } from '../data/orgcheck-api-data-user';
import { DataMatrix } from '../core/orgcheck-api-data-matrix';
import { SFDC_Dashboard } from '../data/orgcheck-api-data-dashboard';

export class RecipeDashboards implements Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfos) that this recipe is using
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Array<string | DatasetRunInformation>} The datasets aliases that this recipe is using
     * @public
     */
    extract(_logger: SimpleLoggerIntf): Array<string | DatasetRunInformation> {
        return [DatasetAliases.INTERNALACTIVEUSERS, DatasetAliases.DASHBOARDS];
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
        const /** @type {Map<string, SFDC_Dashboard>} */ dashboards: Map<string, SFDC_Dashboard> = data.get(DatasetAliases.DASHBOARDS);
        const /** @type {Map<string, SFDC_User>} */ users: Map<string, SFDC_User> = data.get(DatasetAliases.INTERNALACTIVEUSERS);

        // Checking data
        if (!dashboards) throw new Error(`RecipeDashboards: Data from dataset alias 'DASHBOARDS' was undefined.`);
        if (!users) throw new Error(`RecipeDashboards: Data from dataset alias 'INTERNALACTIVEUSERS' was undefined.`);

        // Return data
        return [... dashboards.values()];        
    }
}