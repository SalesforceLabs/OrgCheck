import { Recipe } from 'src/api/core/orgcheck-api-recipe';
import { Processor } from 'src/api/core/orgcheck-api-processor';
import { Data } from 'src/api/core/orgcheck-api-data';
import { DataMatrixIntf } from 'src/api/core/orgcheck-api-data-matrix';
import { SimpleLoggerIntf } from 'src/api/core/orgcheck-api-logger';
import { DatasetRunInformation } from 'src/api/core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from 'src/api/core/orgcheck-api-datasets-aliases';
import { SFDC_VisualForcePage }from 'src/api/data/orgcheck-api-data-visualforcepage';
import { OrgCheckGlobalParameter } from 'src/api/core/orgcheck-api-globalparameter';

export class RecipeVisualForcePages implements Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfos) that this recipe is using
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Array<string | DatasetRunInformation>} The datasets aliases that this recipe is using
     * @public
     */
    extract(_logger: SimpleLoggerIntf): Array<string | DatasetRunInformation> {
        return [DatasetAliases.VISUALFORCEPAGES];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map<string, any>} data - Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} _logger - Logger
     * @param {Map<string, any>} [parameters] - List of optional argument to pass
     * @returns {Promise<Array<Data> | DataMatrixIntf | Data | Map<string, any>>} Returns as it is the value returned by the transform method recipe.
     * @async
     * @public
     */
    async transform(data: Map<string, any>, _logger: SimpleLoggerIntf, parameters: Map<string, any>): Promise<Array<Data> | DataMatrixIntf | Data | Map<string, any>> {

        // Get data and parameters
        const /** @type {Map<string, SFDC_VisualForcePage>} */ pages: Map<string, SFDC_VisualForcePage> = data.get(DatasetAliases.VISUALFORCEPAGES);
        const namespace = OrgCheckGlobalParameter.getPackageName(parameters);

        // Checking data
        if (!pages) throw new Error(`RecipeVisualForcePages: Data from dataset alias 'VISUALFORCEPAGES' was undefined.`);

        // Filter data
        /** @type {Array<SFDC_VisualForcePage>} */ 
        const array: Array<SFDC_VisualForcePage> = [];
        await Processor.forEach(pages, async (/** @type {SFDC_VisualForcePage} */ page: SFDC_VisualForcePage) => {
            if (namespace === OrgCheckGlobalParameter.ALL_VALUES || page.package === namespace) {
                array.push(page);
            }
        });

        // Return data
        return array;
    }
}