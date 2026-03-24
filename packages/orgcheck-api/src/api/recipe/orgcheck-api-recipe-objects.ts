import { Recipe } from 'src/api/core/orgcheck-api-recipe';
import { Processor } from 'src/api/core/orgcheck-api-processor';
import { SimpleLoggerIntf } from 'src/api/core/orgcheck-api-logger';
import { DatasetRunInformation } from 'src/api/core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from 'src/api/core/orgcheck-api-datasets-aliases';
import { SfdcObject }from 'src/api/data/orgcheck-api-data-object';
import { SfdcObjectType }from 'src/api/data/orgcheck-api-data-objecttype';
import { OrgCheckGlobalParameter } from 'src/api/core/orgcheck-api-globalparameter';

export class RecipeObjects implements Recipe<SfdcObject[]> {

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
     * @returns {Promise<SfdcObject[]>} Returns as it is the value returned by the transform method recipe.
     * @async
     * @public
     */
    async transform(data: Map<string, any>, _logger: SimpleLoggerIntf, parameters: Map<string, any>): Promise<SfdcObject[]> {

        // Get data and parameters
        const types: Map<string, SfdcObjectType> = data.get(DatasetAliases.OBJECTTYPES);
        const objects: Map<string, SfdcObject> = data.get(DatasetAliases.OBJECTS);
        const namespace = OrgCheckGlobalParameter.getPackageName(parameters);
        const type = OrgCheckGlobalParameter.getSObjectTypeName(parameters);

        // Checking data
        if (!types) throw new Error(`RecipeObjects: Data from dataset alias 'OBJECTTYPES' was undefined.`);
        if (!objects) throw new Error(`RecipeObjects: Data from dataset alias 'OBJECTS' was undefined.`);

        // Augment and Filter data
        
        const array: Array<SfdcObject> = [];
        await Processor.forEach(objects, async (object: SfdcObject) => {
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