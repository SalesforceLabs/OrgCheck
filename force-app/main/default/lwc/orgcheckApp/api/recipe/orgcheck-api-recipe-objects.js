import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';
import { OrgCheckData, OrgCheckDataWithoutScoring } from '../core/orgcheck-api-data';
import { OrgCheckDataMatrix } from '../core/orgcheck-api-data-matrix';
import { OrgCheckSimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { OrgCheckDatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { OrgCheckDatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { SFDC_Object } from '../data/orgcheck-api-data-object';
import { SFDC_ObjectType } from '../data/orgcheck-api-data-objecttype';

export class OrgCheckRecipeObjects extends OrgCheckRecipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {OrgCheckSimpleLoggerIntf} logger
     * @returns {Array<string | OrgCheckDatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [ OrgCheckDatasetAliases.OBJECTTYPES, OrgCheckDatasetAliases.OBJECTS ];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {OrgCheckSimpleLoggerIntf} logger
     * @param {string} namespace Name of the package (if all use '*')
     * @param {string} type Type of the object to list (optional), '*' for any
     * @returns {Promise<Array<OrgCheckData | OrgCheckDataWithoutScoring> | OrgCheckDataMatrix | OrgCheckData | OrgCheckDataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger, namespace, type) {

        // Get data
        const /** @type {Map<string, SFDC_ObjectType>} */ types = data.get(OrgCheckDatasetAliases.OBJECTTYPES);
        const /** @type {Map<string, SFDC_Object>} */ objects = data.get(OrgCheckDatasetAliases.OBJECTS);

        // Checking data
        if (!types) throw new Error(`Data from dataset alias 'OBJECTTYPES' was undefined.`);
        if (!objects) throw new Error(`Data from dataset alias 'OBJECTS' was undefined.`);

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
        return array.sort((a, b) => { return a.label < b.label ? -1 : 1; });
    }
}