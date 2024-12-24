// @ts-check

import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { OrgCheckDatasetAliases, OrgCheckDatasetRunInformation } from '../core/orgcheck-api-datasetmanager';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';
import { OrgCheckData } from '../core/orgcheck-api-data';
import { OrgCheckMatrixData } from '../core/orgcheck-api-data-matrix';

export class OrgCheckRecipeApexClasses extends OrgCheckRecipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @returns {Array<string | OrgCheckDatasetRunInformation>}
     * @public
     */
    extract() {
        return [
            OrgCheckDatasetAliases.APEXCLASSES
        ];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {string} namespace Name of the package (if all use '*')
     * @returns {Promise<Array<OrgCheckData> | OrgCheckMatrixData | OrgCheckData | Map>}
     * @async
     * @public
     */
    async transform(data, namespace) {
        // Get data
        const apexClasses = data.get(OrgCheckDatasetAliases.APEXCLASSES);
        // Augment data
        await OrgCheckProcessor.forEach(apexClasses, async (apexClass) => {
            apexClass.relatedTestClassRefs = await OrgCheckProcessor.map(apexClass.relatedTestClassIds, id => apexClasses.get(id));
            apexClass.relatedClassRefs = await OrgCheckProcessor.map(apexClass.relatedClassIds, id => apexClasses.get(id));
        });
        // Filter data
        const array = [];
        await OrgCheckProcessor.forEach(apexClasses, (apexClass) => {
            if (namespace === '*' || apexClass.package === namespace) {
                array.push(apexClass);
            }
        });
        // Return data
        return array;
    }
}