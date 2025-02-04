import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';
import { OrgCheckData, OrgCheckDataWithoutScoring } from '../core/orgcheck-api-data';
import { OrgCheckSimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { OrgCheckDatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { OrgCheckDatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { SFDC_ApexClass } from '../data/orgcheck-api-data-apexclass';
import { OrgCheckDataMatrix } from '../core/orgcheck-api-data-matrix';

export class OrgCheckRecipeApexClasses extends OrgCheckRecipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {OrgCheckSimpleLoggerIntf} logger
     * @returns {Array<string | OrgCheckDatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [
            OrgCheckDatasetAliases.APEXCLASSES
        ];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {OrgCheckSimpleLoggerIntf} logger
     * @param {string} namespace Name of the package (if all use '*')
     * @returns {Promise<Array<OrgCheckData | OrgCheckDataWithoutScoring> | OrgCheckDataMatrix | OrgCheckData | OrgCheckDataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger, namespace) {

        // Get data
        const /** @type {Map<string, SFDC_ApexClass>} */ apexClasses = data.get(OrgCheckDatasetAliases.APEXCLASSES);

        // Checking data
        if (!apexClasses) throw new Error(`Data from dataset alias 'APEXCLASSES' was undefined.`);

        // Augment and filter data
        const array = [];
        await OrgCheckProcessor.forEach(apexClasses, async (apexClass) => {            
            // Augment data
            const results = await Promise.all([
                OrgCheckProcessor.map(apexClass.relatedTestClassIds, id => apexClasses.get(id)),
                OrgCheckProcessor.map(apexClass.relatedClassIds, id => apexClasses.get(id))
            ]);
            apexClass.relatedTestClassRefs = results[0];
            apexClass.relatedClassRefs = results[1];
            // Filter data
            if ((namespace === '*' || apexClass.package === namespace) && apexClass.isTest === false && apexClass.needsRecompilation === false) {
                array.push(apexClass);
            }
        });

        // Return data
        return array;
    }
}