import { Recipe } from '../core/orgcheck-api-recipe';
import { Processor } from '../core/orgcheck-api-processor';
import { Data } from '../core/orgcheck-api-data';
import { DataMatrix } from '../core/orgcheck-api-data-matrix';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { DatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { SFDC_LightningWebComponent } from '../data/orgcheck-api-data-lightningwebcomponent';
import { OrgCheckGlobalParameter } from '../core/orgcheck-api-globalparameter';

export class RecipeLightningWebComponents implements Recipe {

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
     * @returns {Promise<Array<Data> | DataMatrix | Data | Map<string, any>>} Returns as it is the value returned by the transform method recipe.
     * @async
     * @public
     */
    async transform(data: Map<string, any>, _logger: SimpleLoggerIntf, parameters: Map<string, any>): Promise<Array<Data> | DataMatrix | Data | Map<string, any>> {

        // Get data and parameters
        const  /** @type {Map<string, SFDC_LightningWebComponent>} */ components: Map<string, SFDC_LightningWebComponent> = data.get(DatasetAliases.LIGHTNINGWEBCOMPONENTS);
        const namespace = OrgCheckGlobalParameter.getPackageName(parameters);

        // Checking data
        if (!components) throw new Error(`RecipeLightningWebComponents: Data from dataset alias 'LIGHTNINGWEBCOMPONENTS' was undefined.`);

        // Filter data
        /** @type {Array<SFDC_LightningWebComponent>} */ 
        const array: Array<SFDC_LightningWebComponent> = [];
        await Processor.forEach(components, async (/** @type {SFDC_LightningWebComponent} */ component: SFDC_LightningWebComponent) => {
            if (namespace === OrgCheckGlobalParameter.ALL_VALUES || component.package === namespace) {
                array.push(component);
            }
        });

        // Return data
        return array;
    }
}