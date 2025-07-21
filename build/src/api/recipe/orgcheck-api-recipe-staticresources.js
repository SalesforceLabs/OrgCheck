import { Recipe } from '../core/orgcheck-api-recipe';
import { Processor } from '../core/orgcheck-api-processor';
import { Data, DataWithoutScoring } from '../core/orgcheck-api-data';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { DatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { DataMatrix } from '../core/orgcheck-api-data-matrix';
import { OrgCheckGlobalParameter } from '../core/orgcheck-api-globalparameter';
import { SFDC_StaticResource } from '../data/orgcheck-api-data-staticresource';

export class RecipeStaticResources extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfos) that this recipe is using
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Array<string | DatasetRunInformation>} The datasets aliases that this recipe is using
     * @public
     */
    extract(_logger) {
        return [
            DatasetAliases.STATICRESOURCES
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
    async transform(data, _logger, parameters) {

        // Get data and parameters
        const /** @type {Map<string, SFDC_StaticResource>} */ staticResources = data.get(DatasetAliases.STATICRESOURCES);
        const namespace = OrgCheckGlobalParameter.getPackageName(parameters);

        // Checking data
        if (!staticResources) throw new Error(`RecipeStaticResources: Data from dataset alias 'STATICRESOURCES' was undefined.`);

        // Augment and filter data
        /** @type {Array<SFDC_StaticResource>} */
        const array = [];
        await Processor.forEach(staticResources, async (/** @type {SFDC_StaticResource} */ staticResource) => {            
            // Filter data
            if (namespace === OrgCheckGlobalParameter.ALL_VALUES || staticResource.package === namespace) {
                array.push(staticResource);
            }
        });

        // Return data
        return array;
    }
}