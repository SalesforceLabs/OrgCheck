import { Recipe } from '../core/orgcheck-api-recipe';
import { Processor } from '../core/orgcheck-api-processor';
import { Data, DataWithoutScoring } from '../core/orgcheck-api-data';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { DatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { SFDC_ApexClass } from '../data/orgcheck-api-data-apexclass';
import { DataMatrix } from '../core/orgcheck-api-data-matrix';
import { OrgCheckGlobalParameter } from '../core/orgcheck-api-globalparameter';

export class RecipeApexClasses extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {SimpleLoggerIntf} logger
     * @returns {Array<string | DatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [
            DatasetAliases.APEXCLASSES
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
        const /** @type {Map<string, SFDC_ApexClass>} */ apexClasses = data.get(DatasetAliases.APEXCLASSES);
        const namespace = OrgCheckGlobalParameter.getPackageName(parameters);

        // Checking data
        if (!apexClasses) throw new Error(`RecipeApexClasses: Data from dataset alias 'APEXCLASSES' was undefined.`);

        // Augment and filter data
        const array = [];
        await Processor.forEach(apexClasses, async (apexClass) => {            
            // Augment data
            const results = await Promise.all([
                Processor.map(apexClass.relatedTestClassIds, id => apexClasses.get(id)),
                Processor.map(apexClass.relatedClassIds, id => apexClasses.get(id))
            ]);
            apexClass.relatedTestClassRefs = results[0];
            apexClass.relatedClassRefs = results[1];
            // Filter data
            if ((namespace === OrgCheckGlobalParameter.ALL_VALUES || apexClass.package === namespace) && apexClass.isTest === false && apexClass.needsRecompilation === false) {
                array.push(apexClass);
            }
        });

        // Return data
        return array;
    }
}