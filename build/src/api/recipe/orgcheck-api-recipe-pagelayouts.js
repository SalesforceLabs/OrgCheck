import { Recipe } from '../core/orgcheck-api-recipe';
import { Processor } from '../core/orgcheck-api-processor';
import { Data, DataWithoutScoring } from '../core/orgcheck-api-data';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { DatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { SFDC_Object } from '../data/orgcheck-api-data-object';
import { SFDC_PageLayout } from '../data/orgcheck-api-data-pagelayout';
import { DataMatrix } from '../core/orgcheck-api-data-matrix';
import { SFDC_ObjectType } from '../data/orgcheck-api-data-objecttype';
import { OrgCheckGlobalParameter } from '../core/orgcheck-api-globalparameter';

export class RecipePageLayouts extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfos) that this recipe is using
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Array<string | DatasetRunInformation>} The datasets aliases that this recipe is using
     * @public
     */
    extract(_logger) {
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
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map<string, any>>} Returns as it is the value returned by the transform method recipe.
     * @async
     * @public
     */
    async transform(data, _logger, parameters) {

        // Get data and parameters
        const /** @type {Map<string, SFDC_PageLayout>} */ pageLayouts = data.get(DatasetAliases.PAGELAYOUTS);
        const /** @type {Map<string, SFDC_ObjectType>} */ types = data.get(DatasetAliases.OBJECTTYPES);
        const /** @type {Map<string, SFDC_Object>} */ objects = data.get(DatasetAliases.OBJECTS);
        const namespace = OrgCheckGlobalParameter.getPackageName(parameters);
        const objecttype = OrgCheckGlobalParameter.getSObjectTypeName(parameters);
        const object = OrgCheckGlobalParameter.getSObjectName(parameters);

        // Checking data
        if (!types) throw new Error(`RecipePageLayouts: Data from dataset alias 'OBJECTTYPES' was undefined.`);
        if (!objects) throw new Error(`RecipePageLayouts: Data from dataset alias 'OBJECTS' was undefined.`);
        if (!pageLayouts) throw new Error(`RecipePageLayouts: Data from dataset alias 'PAGELAYOUTS' was undefined.`);

        // Augment and filter data
        /** @type {Array<SFDC_PageLayout>} */
        const array = [];
        await Processor.forEach(pageLayouts, (/** @type {SFDC_PageLayout} */ pageLayout) => {
            // Augment data
            const objectRef = objects.get(pageLayout.objectId);
            if (objectRef && !objectRef.typeRef) {
                objectRef.typeRef = types.get(objectRef.typeId);
            }
            pageLayout.objectRef = objectRef;
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