import { Recipe } from '../core/orgcheck-api-recipe';
import { Processor } from '../core/orgcheck-api-processing';
import { Data, DataWithoutScoring } from '../core/orgcheck-api-data';
import { DataMatrix } from '../core/orgcheck-api-data-matrix';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { DatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { SFDC_Object } from '../data/orgcheck-api-data-object';
import { SFDC_ObjectType } from '../data/orgcheck-api-data-objecttype';

export class RecipeObjects extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {SimpleLoggerIntf} logger
     * @returns {Array<string | DatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [ DatasetAliases.OBJECTTYPES, DatasetAliases.OBJECTS ];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} logger
     * @param {string} namespace Name of the package (if all use '*')
     * @param {string} type Type of the object to list (optional), '*' for any
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger, namespace, type) {

        // Get data
        const /** @type {Map<string, SFDC_ObjectType>} */ types = data.get(DatasetAliases.OBJECTTYPES);
        const /** @type {Map<string, SFDC_Object>} */ objects = data.get(DatasetAliases.OBJECTS);

        // Checking data
        if (!types) throw new Error(`RecipeObjects: Data from dataset alias 'OBJECTTYPES' was undefined.`);
        if (!objects) throw new Error(`RecipeObjects: Data from dataset alias 'OBJECTS' was undefined.`);

        // Augment and Filter data
        const array = [];
        await Processor.forEach(objects, (object) => {
            // Augment data
            object.typeRef = types.get(object.typeId);
            // Filter data
            if ((namespace === '*' || object.package === namespace) &&
                (type === '*' || object.typeRef?.id === type)) {
                array.push(object);
            }
        });

        // Return data
        return array.sort((a, b) => { return a.label < b.label ? -1 : 1; });
    }
}