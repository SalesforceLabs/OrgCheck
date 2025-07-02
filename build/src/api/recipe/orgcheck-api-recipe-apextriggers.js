import { Recipe } from '../core/orgcheck-api-recipe';
import { Processor } from '../core/orgcheck-api-processor';
import { Data, DataWithoutScoring } from '../core/orgcheck-api-data';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { DatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { SFDC_Object } from '../data/orgcheck-api-data-object';
import { SFDC_ApexTrigger } from '../data/orgcheck-api-data-apextrigger';
import { DataMatrix } from '../core/orgcheck-api-data-matrix';
import { OrgCheckGlobalParameter } from '../core/orgcheck-api-globalparameter';

export class RecipeApexTriggers extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {SimpleLoggerIntf} logger
     * @returns {Array<string | DatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [
            DatasetAliases.APEXTRIGGERS,
            DatasetAliases.OBJECTS
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
        const /** @type {Map<string, SFDC_ApexTrigger>} */ apexTriggers = data.get(DatasetAliases.APEXTRIGGERS);
        const /** @type {Map<string, SFDC_Object>} */ objects = data.get(DatasetAliases.OBJECTS);
        const namespace = OrgCheckGlobalParameter.getPackageName(parameters);

        // Checking data
        if (!apexTriggers) throw new Error(`RecipeApexTriggers: Data from dataset alias 'APEXTRIGGERS' was undefined.`);
        if (!objects) throw new Error(`RecipeApexTriggers: Data from dataset alias 'OBJECTS' was undefined.`);

        // Augment and filter data
        const array = [];
        await Processor.forEach(apexTriggers, (apexTrigger) => {
            // Augment data
            apexTrigger.objectRef = objects.get(apexTrigger.objectId);
            // Filter data
            if (namespace === OrgCheckGlobalParameter.ALL_VALUES || apexTrigger.package === namespace) {
                array.push(apexTrigger);
            }
        });

        // Return data
        return array;
    }
}