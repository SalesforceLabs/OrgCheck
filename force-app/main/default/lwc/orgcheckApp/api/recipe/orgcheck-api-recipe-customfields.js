// @ts-check

import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { OrgCheckDatasetAliases, OrgCheckDatasetRunInformation } from '../core/orgcheck-api-datasetmanager';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';
import { OrgCheckData } from '../core/orgcheck-api-data';
import { OrgCheckMatrixData } from '../core/orgcheck-api-data-matrix';

export class OrgCheckRecipeCustomFields extends OrgCheckRecipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @returns {Array<string | OrgCheckDatasetRunInformation>}
     * @public
     */
    extract() {
        return [
            OrgCheckDatasetAliases.CUSTOMFIELDS, 
            OrgCheckDatasetAliases.OBJECTTYPES, 
            OrgCheckDatasetAliases.OBJECTS
        ];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {string} namespace Name of the package (if all use '*')
     * @param {string} objecttype Name of the type (if all use '*')
     * @param {string} object API name of the object (if all use '*')
     * @returns {Promise<Array<OrgCheckData> | OrgCheckMatrixData | OrgCheckData | Map>}
     * @async
     * @public
     */
    async transform(data, namespace, objecttype, object) {
        // Get data
        const types = data.get(OrgCheckDatasetAliases.OBJECTTYPES);
        const objects = data.get(OrgCheckDatasetAliases.OBJECTS);
        const customFields = data.get(OrgCheckDatasetAliases.CUSTOMFIELDS);
        // Augment data
        await OrgCheckProcessor.forEach(objects, (obj) => {
            obj.typeRef = types.get(obj.typeId);
        });
        await OrgCheckProcessor.forEach(customFields, (customField) => {
            customField.objectRef = objects.get(customField.objectId);
        });
        // Filter data
        const array = [];
        await OrgCheckProcessor.forEach(customFields, (customField) => {
            if ((namespace === '*' || customField.package === namespace) &&
                (objecttype === '*' || customField.objectRef?.typeRef?.id === objecttype) &&
                (object === '*' || customField.objectRef?.apiname === object)) {
                array.push(customField);
            }
        });
        // Return data
        return array;
    }
}