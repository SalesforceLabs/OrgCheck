import { Recipe } from '../core/orgcheck-api-recipe';
import { Processor } from '../core/orgcheck-api-processor';
import { Data } from '../core/orgcheck-api-data';
import { DataMatrix } from '../core/orgcheck-api-data-matrix';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { DatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { SFDC_Object } from '../data/orgcheck-api-data-object';
import { SFDC_ObjectType } from '../data/orgcheck-api-data-objecttype';
import { OrgCheckGlobalParameter } from '../core/orgcheck-api-globalparameter';

export class RecipeObjects implements Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfos) that this recipe is using
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Array<string | DatasetRunInformation>} The datasets aliases that this recipe is using
     * @public
     */
    extract(_logger: SimpleLoggerIntf): Array<string | DatasetRunInformation> {
        return [ DatasetAliases.OBJECTTYPES, DatasetAliases.OBJECTS ];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map<string, any>} data - Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} _logger - Logger
     * @param {Map<string, any>} [parameters] - List of optional argument to pass
     * @returns {Promise<Array<Data> | DataMatrix | Data | Map<string, any>>} Returns as it is the value returned by the transform method recipe.
     * @async
     * @public
     */
    async transform(data: Map<string, any>, _logger: SimpleLoggerIntf, parameters: Map<string, any>): Promise<Array<Data> | DataMatrix | Data | Map<string, any>> {

        // Get data and parameters
        const /** @type {Map<string, SFDC_ObjectType>} */ types: Map<string, SFDC_ObjectType> = data.get(DatasetAliases.OBJECTTYPES);
        const /** @type {Map<string, SFDC_Object>} */ objects: Map<string, SFDC_Object> = data.get(DatasetAliases.OBJECTS);
        const namespace = OrgCheckGlobalParameter.getPackageName(parameters);
        const type = OrgCheckGlobalParameter.getSObjectTypeName(parameters);

        // Checking data
        if (!types) throw new Error(`RecipeObjects: Data from dataset alias 'OBJECTTYPES' was undefined.`);
        if (!objects) throw new Error(`RecipeObjects: Data from dataset alias 'OBJECTS' was undefined.`);

        // Augment and Filter data
        /** @type {Array<SFDC_Object>} */ 
        const array: Array<SFDC_Object> = [];
        await Processor.forEach(objects, async (/** @type {SFDC_Object} */ object: SFDC_Object) => {
            // Augment data
            const typeRef = types.get(object.typeId);
            if (typeRef) {
                object.typeRef = typeRef;
            }
            // Filter data
            if ((namespace === OrgCheckGlobalParameter.ALL_VALUES || object.package === namespace) &&
                (type === OrgCheckGlobalParameter.ALL_VALUES || object.typeRef?.id === type)) {
                array.push(object);
            }
        });

        // Return data
        return array.sort((a, b) => { return a.label < b.label ? -1 : 1; });
    }
}