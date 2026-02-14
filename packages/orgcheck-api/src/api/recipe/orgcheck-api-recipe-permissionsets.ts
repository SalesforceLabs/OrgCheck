import { Recipe } from '../core/orgcheck-api-recipe';
import { Processor } from '../core/orgcheck-api-processor';
import { Data, DataWithoutScoring } from '../core/orgcheck-api-data';
import { DataMatrix } from '../core/orgcheck-api-data-matrix';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { DatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { SFDC_PermissionSet } from '../data/orgcheck-api-data-permissionset';
import { OrgCheckGlobalParameter } from '../core/orgcheck-api-globalparameter';

export class RecipePermissionSets implements Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfos) that this recipe is using
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Array<string | DatasetRunInformation>} The datasets aliases that this recipe is using
     * @public
     */
    extract(_logger: SimpleLoggerIntf): Array<string | DatasetRunInformation> {
        return [
            DatasetAliases.PERMISSIONSETS
        ];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map<string, any>} data - Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} _logger - Logger
     * @param {Map<string, any>} [parameters] - List of optional argument to pass
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map<string, any>>} Returns as it is the value returned by the transform method recipe.
     * @async
     * @public
     */
    async transform(data: Map<string, any>, _logger: SimpleLoggerIntf, parameters: Map<string, any>): Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map<string, any>> {

        // Get data and parameters
        const /** @type {Map<string, SFDC_PermissionSet>} */ permissionSets: Map<string, SFDC_PermissionSet> = data.get(DatasetAliases.PERMISSIONSETS);
        const namespace = OrgCheckGlobalParameter.getPackageName(parameters);

        // Checking data
        if (!permissionSets) throw new Error(`RecipePermissionSets: Data from dataset alias 'PERMISSIONSETS' was undefined.`);

        // Augment and Filter data
        /** @type {Array<SFDC_PermissionSet>} */
        const array: Array<SFDC_PermissionSet> = [];
        await Processor.forEach(permissionSets, async (/** @type {SFDC_PermissionSet} */ permissionSet: SFDC_PermissionSet) => {
            // Augment data
            const results = await Promise.all([
                Processor.map(permissionSet.permissionSetIds, (/** @type {string} */ id: string) => permissionSets.get(id)),
                Processor.map(permissionSet.permissionSetGroupIds, (/** @type {string} */ id: string) => permissionSets.get(id))
            ]);
            permissionSet.permissionSetRefs = results[0];
            permissionSet.permissionSetGroupRefs = results[1];

            // Filter data
            if (namespace === OrgCheckGlobalParameter.ALL_VALUES || permissionSet.package === namespace) {
                array.push(permissionSet);
            }
        });

        // Return data
        return array;
    }
}