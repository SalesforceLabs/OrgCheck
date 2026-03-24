import { Recipe } from 'src/api/core/orgcheck-api-recipe';
import { SimpleLoggerIntf } from 'src/api/core/orgcheck-api-logger';
import { DatasetRunInformation } from 'src/api/core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from 'src/api/core/orgcheck-api-datasets-aliases';
import { SfdcUser }from 'src/api/data/orgcheck-api-data-user';
import { SfdcDashboard }from 'src/api/data/orgcheck-api-data-dashboard';

export class RecipeDashboards implements Recipe<SfdcDashboard[]> {

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
     * @returns {Promise<SfdcDashboard[]>} Returns as it is the value returned by the transform method recipe.
     * @async
     * @public
     */
    async transform(data: Map<string, any>, _logger: SimpleLoggerIntf): Promise<SfdcDashboard[]> {

        // Get data
        const dashboards: Map<string, SfdcDashboard> = data.get(DatasetAliases.DASHBOARDS);
        const users: Map<string, SfdcUser> = data.get(DatasetAliases.INTERNALACTIVEUSERS);

        // Checking data
        if (!dashboards) throw new Error(`RecipeDashboards: Data from dataset alias 'DASHBOARDS' was undefined.`);
        if (!users) throw new Error(`RecipeDashboards: Data from dataset alias 'INTERNALACTIVEUSERS' was undefined.`);

        // Return data
        return [... dashboards.values()];        
    }
}