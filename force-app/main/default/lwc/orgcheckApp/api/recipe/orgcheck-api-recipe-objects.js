// @ts-check

import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { OrgCheckDatasetAliases, OrgCheckDatasetRunInformation } from '../core/orgcheck-api-datasetmanager';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';
import { OrgCheckData } from '../core/orgcheck-api-data';
import { OrgCheckMatrixData } from '../core/orgcheck-api-data-matrix';

export class OrgCheckRecipeObjects extends OrgCheckRecipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @returns {Array<string | OrgCheckDatasetRunInformation>}
     * @public
     */
    extract() {
        return [ OrgCheckDatasetAliases.OBJECTTYPES, OrgCheckDatasetAliases.OBJECTS ];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {string} namespace Name of the package (if all use '*')
     * @param {string} type Type of the object to list (optional), '*' for any
     * @returns {Promise<Array<OrgCheckData> | OrgCheckMatrixData | OrgCheckData | Map>}
     * @async
     * @public
     */
    async transform(data, namespace, type) {
        // Get data
        const types = data.get(OrgCheckDatasetAliases.OBJECTTYPES);
        const objects = data.get(OrgCheckDatasetAliases.OBJECTS);
        // Augment data
        await OrgCheckProcessor.forEach(objects, (object) => {
            object.typeRef = types.get(object.typeId);
        });
        // Filter data
        const array = [];
        await OrgCheckProcessor.forEach(objects, (object) => {
            if ((namespace === '*' || object.package === namespace) &&
                (type === '*' || object.typeRef?.id === type)) {
                array.push(object);
            }
        });
        // Return data
        return array;
    }
}