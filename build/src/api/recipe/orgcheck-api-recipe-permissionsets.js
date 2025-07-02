import { Recipe } from '../core/orgcheck-api-recipe';
import { Processor } from '../core/orgcheck-api-processor';
import { Data, DataWithoutScoring } from '../core/orgcheck-api-data';
import { DataMatrix } from '../core/orgcheck-api-data-matrix';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { DatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { SFDC_PermissionSet } from '../data/orgcheck-api-data-permissionset';
import { OrgCheckGlobalParameter } from '../core/orgcheck-api-globalparameter';

export class RecipePermissionSets extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {SimpleLoggerIntf} logger
     * @returns {Array<string | DatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [
            DatasetAliases.PERMISSIONSETS
        ];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} logger
     * @param {Map | undefined} [parameters] List of optional argument to pass
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger, parameters) {

        // Get data and parameters
        const /** @type {Map<string, SFDC_PermissionSet>} */ permissionSets = data.get(DatasetAliases.PERMISSIONSETS);
        const namespace = OrgCheckGlobalParameter.getPackageName(parameters);

        // Checking data
        if (!permissionSets) throw new Error(`RecipePermissionSets: Data from dataset alias 'PERMISSIONSETS' was undefined.`);

        // Augment and Filter data
        const array = [];
        await Processor.forEach(permissionSets, async (permissionSet) => {
            // Filter data
            if (namespace === OrgCheckGlobalParameter.ALL_VALUES || permissionSet.package === namespace) {
                array.push(permissionSet);
            }
        });

        // Return data
        return array;
    }
}