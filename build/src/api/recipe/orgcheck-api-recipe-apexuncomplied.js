import { Recipe } from '../core/orgcheck-api-recipe';
import { Processor } from '../core/orgcheck-api-processing';
import { Data, DataWithoutScoring } from '../core/orgcheck-api-data';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { DatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { SFDC_ApexClass } from '../data/orgcheck-api-data-apexclass';
import { DataMatrix } from '../core/orgcheck-api-data-matrix';

export class RecipeApexUncompiled extends Recipe {

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
     * @param {string} namespace Name of the package (if all use '*')
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger, namespace) {

        // Get data
        const /** @type {Map<string, SFDC_ApexClass>} */ apexClasses = data.get(DatasetAliases.APEXCLASSES);

        // Checking data
        if (!apexClasses) throw new Error(`RecipeApexUncompiled: Data from dataset alias 'APEXCLASSES' was undefined.`);

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
            if ((namespace === '*' || apexClass.package === namespace) && apexClass.needsRecompilation === true) {
                array.push(apexClass);
            }
        });

        // Return data
        return array;
    }
}