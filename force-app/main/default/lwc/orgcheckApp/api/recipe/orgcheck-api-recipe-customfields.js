import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';
import { OrgCheckData, OrgCheckDataWithoutScoring } from '../core/orgcheck-api-data';
import { OrgCheckSimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { OrgCheckDatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { OrgCheckDatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { SFDC_Field } from '../data/orgcheck-api-data-field';
import { SFDC_Object } from '../data/orgcheck-api-data-object';
import { SFDC_ObjectType } from '../data/orgcheck-api-data-objecttype';
import { OrgCheckDataMatrix } from '../core/orgcheck-api-data-matrix';

export class OrgCheckRecipeCustomFields extends OrgCheckRecipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {OrgCheckSimpleLoggerIntf} logger
     * @returns {Array<string | OrgCheckDatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [
            OrgCheckDatasetAliases.CUSTOMFIELDS, 
            OrgCheckDatasetAliases.OBJECTTYPES, 
            OrgCheckDatasetAliases.OBJECTS
        ];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {OrgCheckSimpleLoggerIntf} logger
     * @param {string} namespace Name of the package (if all use '*')
     * @param {string} objecttype Name of the type (if all use '*')
     * @param {string} object API name of the object (if all use '*')
     * @returns {Promise<Array<OrgCheckData | OrgCheckDataWithoutScoring> | OrgCheckDataMatrix | OrgCheckData | OrgCheckDataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger, namespace, objecttype, object) {

        // Get data
        const /** @type {Map<string, SFDC_ObjectType>} */ types = data.get(OrgCheckDatasetAliases.OBJECTTYPES);
        const /** @type {Map<string, SFDC_Object>} */ objects = data.get(OrgCheckDatasetAliases.OBJECTS);
        const /** @type {Map<string, SFDC_Field>} */ customFields = data.get(OrgCheckDatasetAliases.CUSTOMFIELDS);

        // Checking data
        if (!types) throw new Error(`Data from dataset alias 'OBJECTTYPES' was undefined.`);
        if (!objects) throw new Error(`Data from dataset alias 'OBJECTS' was undefined.`);
        if (!customFields) throw new Error(`Data from dataset alias 'CUSTOMFIELDS' was undefined.`);

        // Augment data
        await OrgCheckProcessor.forEach(customFields, (customField) => {
            const object = objects.get(customField.objectId);
            if (object && !object.typeRef) {
                object.typeRef = types.get(object.typeId);
            }
            customField.objectRef = object;
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