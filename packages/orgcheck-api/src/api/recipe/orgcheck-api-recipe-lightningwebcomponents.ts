import { Recipe } from 'src/api/core/orgcheck-api-recipe';
import { Processor } from 'src/api/core/orgcheck-api-processor';
import { SimpleLoggerIntf } from 'src/api/core/orgcheck-api-logger';
import { DatasetRunInformation } from 'src/api/core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from 'src/api/core/orgcheck-api-datasets-aliases';
import { SfdcLightningWebComponent }from 'src/api/data/orgcheck-api-data-lightningwebcomponent';
import { OrgCheckGlobalParameter } from 'src/api/core/orgcheck-api-globalparameter';

export class RecipeLightningWebComponents implements Recipe<SfdcLightningWebComponent[]> {

    /**
     * @description List all dataset aliases (or datasetRunInfos) that this recipe is using
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Array<string | DatasetRunInformation>} The datasets aliases that this recipe is using
     * @public
     */
    extract(_logger: SimpleLoggerIntf): Array<string | DatasetRunInformation> {
        return [DatasetAliases.LIGHTNINGWEBCOMPONENTS];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map<string, any>} data - Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} _logger - Logger
     * @param {Map<string, any>} [parameters] - List of optional argument to pass
     * @returns {Promise<SfdcLightningWebComponent[]>} Returns as it is the value returned by the transform method recipe.
     * @async
     * @public
     */
    async transform(data: Map<string, any>, _logger: SimpleLoggerIntf, parameters: Map<string, any>): Promise<SfdcLightningWebComponent[]> {

        // Get data and parameters
        const  components: Map<string, SfdcLightningWebComponent> = data.get(DatasetAliases.LIGHTNINGWEBCOMPONENTS);
        const namespace = OrgCheckGlobalParameter.getPackageName(parameters);

        // Checking data
        if (!components) throw new Error(`RecipeLightningWebComponents: Data from dataset alias 'LIGHTNINGWEBCOMPONENTS' was undefined.`);

        // Filter data
        
        const array: Array<SfdcLightningWebComponent> = [];
        await Processor.forEach(components, async (component: SfdcLightningWebComponent) => {
            if (namespace === OrgCheckGlobalParameter.ALL_VALUES || component.package === namespace) {
                array.push(component);
            }
        });

        // Return data
        return array;
    }
}