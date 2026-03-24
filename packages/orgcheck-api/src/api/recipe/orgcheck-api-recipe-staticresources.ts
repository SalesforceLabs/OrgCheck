import { Recipe } from 'src/api/core/orgcheck-api-recipe';
import { Processor } from 'src/api/core/orgcheck-api-processor';
import { SimpleLoggerIntf } from 'src/api/core/orgcheck-api-logger';
import { DatasetRunInformation } from 'src/api/core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from 'src/api/core/orgcheck-api-datasets-aliases';
import { OrgCheckGlobalParameter } from 'src/api/core/orgcheck-api-globalparameter';
import { SfdcStaticResource }from 'src/api/data/orgcheck-api-data-staticresource';

export class RecipeStaticResources implements Recipe<SfdcStaticResource[]> {

    /**
     * @description List all dataset aliases (or datasetRunInfos) that this recipe is using
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Array<string | DatasetRunInformation>} The datasets aliases that this recipe is using
     * @public
     */
    extract(_logger: SimpleLoggerIntf): Array<string | DatasetRunInformation> {
        return [
            DatasetAliases.STATICRESOURCES
        ];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map<string, any>} data - Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} _logger - Logger
     * @param {Map<string, any>} [parameters] - List of optional argument to pass
     * @returns {Promise<SfdcStaticResource[]>} Returns as it is the value returned by the transform method recipe.
     * @async
     * @public
     */
    async transform(data: Map<string, any>, _logger: SimpleLoggerIntf, parameters: Map<string, any>): Promise<SfdcStaticResource[]> {

        // Get data and parameters
        const staticResources: Map<string, SfdcStaticResource> = data.get(DatasetAliases.STATICRESOURCES);
        const namespace = OrgCheckGlobalParameter.getPackageName(parameters);

        // Checking data
        if (!staticResources) throw new Error(`RecipeStaticResources: Data from dataset alias 'STATICRESOURCES' was undefined.`);

        // Augment and filter data
        const array: Array<SfdcStaticResource> = [];
        await Processor.forEach(staticResources, async (staticResource: SfdcStaticResource) => {            
            // Filter data
            if (namespace === OrgCheckGlobalParameter.ALL_VALUES || staticResource.package === namespace) {
                array.push(staticResource);
            }
        });

        // Return data
        return array;
    }
}