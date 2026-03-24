import { Recipe } from 'src/api/core/orgcheck-api-recipe';
import { Processor } from 'src/api/core/orgcheck-api-processor';
import { SimpleLoggerIntf } from 'src/api/core/orgcheck-api-logger';
import { DatasetRunInformation } from 'src/api/core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from 'src/api/core/orgcheck-api-datasets-aliases';
import { SfdcVisualForcePage }from 'src/api/data/orgcheck-api-data-visualforcepage';
import { OrgCheckGlobalParameter } from 'src/api/core/orgcheck-api-globalparameter';

export class RecipeVisualForcePages implements Recipe<SfdcVisualForcePage[]> {

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
     * @returns {Promise<SfdcVisualForcePage[]>} Returns as it is the value returned by the transform method recipe.
     * @async
     * @public
     */
    async transform(data: Map<string, any>, _logger: SimpleLoggerIntf, parameters: Map<string, any>): Promise<SfdcVisualForcePage[]> {

        // Get data and parameters
        const pages: Map<string, SfdcVisualForcePage> = data.get(DatasetAliases.VISUALFORCEPAGES);
        const namespace = OrgCheckGlobalParameter.getPackageName(parameters);

        // Checking data
        if (!pages) throw new Error(`RecipeVisualForcePages: Data from dataset alias 'VISUALFORCEPAGES' was undefined.`);

        // Filter data
        
        const array: Array<SfdcVisualForcePage> = [];
        await Processor.forEach(pages, async (page: SfdcVisualForcePage) => {
            if (namespace === OrgCheckGlobalParameter.ALL_VALUES || page.package === namespace) {
                array.push(page);
            }
        });

        // Return data
        return array;
    }
}