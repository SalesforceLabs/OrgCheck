// @ts-check

import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { OrgCheckDatasetAliases, OrgCheckDatasetRunInformation } from '../core/orgcheck-api-datasetmanager';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';
import { OrgCheckData } from '../core/orgcheck-api-data';
import { OrgCheckMatrixData } from '../core/orgcheck-api-data-matrix';

export class OrgCheckRecipeVisualForceComponents extends OrgCheckRecipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @returns {Array<string | OrgCheckDatasetRunInformation>}
     * @public
     */
    extract() {
        return [OrgCheckDatasetAliases.VISUALFORCEOMPONENTS];
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
        const components = data.get(OrgCheckDatasetAliases.VISUALFORCEOMPONENTS);
        // Filter data
        const array = [];
        await OrgCheckProcessor.forEach(components, (component) => {
            if (namespace === '*' || component.package === namespace) {
                array.push(component);
            }
        });
        // Return data
        return array;
    }
}