import { Recipe } from '../core/orgcheck-api-recipe';
import { Processor } from '../core/orgcheck-api-processor';
import { Data } from '../core/orgcheck-api-data';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { DatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { SFDC_Object } from '../data/orgcheck-api-data-object';
import { SFDC_ApexTrigger } from '../data/orgcheck-api-data-apextrigger';
import { DataMatrix } from '../core/orgcheck-api-data-matrix';
import { OrgCheckGlobalParameter } from '../core/orgcheck-api-globalparameter';

export class RecipeApexTriggers implements Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfos) that this recipe is using
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Array<string | DatasetRunInformation>} The datasets aliases that this recipe is using
     * @public
     */
    extract(_logger: SimpleLoggerIntf): Array<string | DatasetRunInformation> {
        return [
            DatasetAliases.APEXTRIGGERS,
            DatasetAliases.OBJECTS
        ];
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
        const apexTriggers: Map<string, SFDC_ApexTrigger> = data.get(DatasetAliases.APEXTRIGGERS);
        const objects: Map<string, SFDC_Object> = data.get(DatasetAliases.OBJECTS);
        const namespace = OrgCheckGlobalParameter.getPackageName(parameters);

        // Checking data
        if (!apexTriggers) throw new Error(`RecipeApexTriggers: Data from dataset alias 'APEXTRIGGERS' was undefined.`);
        if (!objects) throw new Error(`RecipeApexTriggers: Data from dataset alias 'OBJECTS' was undefined.`);

        // Augment and filter data
        const array: Array<SFDC_ApexTrigger> = [];
        await Processor.forEach(apexTriggers, async (apexTrigger: SFDC_ApexTrigger) => {
            // Augment data
            const objectRef = objects.get(apexTrigger.objectId);
            if (objectRef) {
                apexTrigger.objectRef = objectRef;
            }
            // Filter data
            if (namespace === OrgCheckGlobalParameter.ALL_VALUES || apexTrigger.package === namespace) {
                array.push(apexTrigger);
            }
        });

        // Return data
        return array;
    }
}