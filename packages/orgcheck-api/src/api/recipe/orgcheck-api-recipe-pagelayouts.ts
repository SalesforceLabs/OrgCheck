import { Recipe } from 'src/api/core/orgcheck-api-recipe';
import { Processor } from 'src/api/core/orgcheck-api-processor';
import { SimpleLoggerIntf } from 'src/api/core/orgcheck-api-logger';
import { DatasetRunInformation } from 'src/api/core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from 'src/api/core/orgcheck-api-datasets-aliases';
import { SfdcObject }from 'src/api/data/orgcheck-api-data-object';
import { SfdcPageLayout }from 'src/api/data/orgcheck-api-data-pagelayout';
import { SfdcObjectType }from 'src/api/data/orgcheck-api-data-objecttype';
import { OrgCheckGlobalParameter } from 'src/api/core/orgcheck-api-globalparameter';

export class RecipePageLayouts implements Recipe<SfdcPageLayout[]> {

    /**
     * @description List all dataset aliases (or datasetRunInfos) that this recipe is using
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Array<string | DatasetRunInformation>} The datasets aliases that this recipe is using
     * @public
     */
    extract(_logger: SimpleLoggerIntf): Array<string | DatasetRunInformation> {
        return [
            DatasetAliases.PAGELAYOUTS,
            DatasetAliases.OBJECTTYPES, 
            DatasetAliases.OBJECTS
        ];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map<string, any>} data - Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} _logger - Logger
     * @param {Map<string, any>} [parameters] - List of optional argument to pass
     * @returns {Promise<SfdcPageLayout[]>} Returns as it is the value returned by the transform method recipe.
     * @async
     * @public
     */
    async transform(data: Map<string, any>, _logger: SimpleLoggerIntf, parameters: Map<string, any>): Promise<SfdcPageLayout[]> {

        // Get data and parameters
        const pageLayouts: Map<string, SfdcPageLayout> = data.get(DatasetAliases.PAGELAYOUTS);
        const types: Map<string, SfdcObjectType> = data.get(DatasetAliases.OBJECTTYPES);
        const objects: Map<string, SfdcObject> = data.get(DatasetAliases.OBJECTS);
        const namespace = OrgCheckGlobalParameter.getPackageName(parameters);
        const objecttype = OrgCheckGlobalParameter.getSObjectTypeName(parameters);
        const object = OrgCheckGlobalParameter.getSObjectName(parameters);

        // Checking data
        if (!types) throw new Error(`RecipePageLayouts: Data from dataset alias 'OBJECTTYPES' was undefined.`);
        if (!objects) throw new Error(`RecipePageLayouts: Data from dataset alias 'OBJECTS' was undefined.`);
        if (!pageLayouts) throw new Error(`RecipePageLayouts: Data from dataset alias 'PAGELAYOUTS' was undefined.`);

        // Augment and filter data
        const array: Array<SfdcPageLayout> = [];
        await Processor.forEach(pageLayouts, async (pageLayout: SfdcPageLayout) => {
            // Augment data
            const objectRef = objects.get(pageLayout.objectId);
            if (objectRef) {
                if (objectRef.typeRef === undefined) {
                    const typeObjectRef = types.get(objectRef.typeId);
                    if (typeObjectRef) {
                        objectRef.typeRef = typeObjectRef;
                    }
                }
                pageLayout.objectRef = objectRef;
            }
            // Filter data
            if ((namespace === OrgCheckGlobalParameter.ALL_VALUES || pageLayout.package === namespace) &&
                (objecttype === OrgCheckGlobalParameter.ALL_VALUES || pageLayout.objectRef?.typeRef?.id === objecttype) &&
                (object === OrgCheckGlobalParameter.ALL_VALUES || pageLayout.objectRef?.apiname === object)) {
                array.push(pageLayout);
            }
        });

        // Return data
        return array;
    }
}