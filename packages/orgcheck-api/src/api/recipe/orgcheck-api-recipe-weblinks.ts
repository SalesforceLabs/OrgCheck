import { Recipe } from '../core/orgcheck-api-recipe';
import { Data, DataWithoutScoring } from '../core/orgcheck-api-data';
import { DataMatrix } from '../core/orgcheck-api-data-matrix';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { DatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { SFDC_WebLink } from '../data/orgcheck-api-data-weblink';
import { Processor } from '../core/orgcheck-api-processor';
import { SFDC_Object } from '../data/orgcheck-api-data-object';
import { SFDC_ObjectType } from '../data/orgcheck-api-data-objecttype';
import { OrgCheckGlobalParameter } from '../core/orgcheck-api-globalparameter';

export class RecipeWebLinks implements Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfos) that this recipe is using
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Array<string | DatasetRunInformation>} The datasets aliases that this recipe is using
     * @public
     */
    extract(_logger: SimpleLoggerIntf): Array<string | DatasetRunInformation> {
        return [
            DatasetAliases.OBJECTTYPES,
            DatasetAliases.OBJECTS,
            DatasetAliases.WEBLINKS
        ];
    }

    /**
     * @description transform the data from the datasets and return the final result as an Array
     * @param {Map<string, any>} data - Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} logger - Logger
     * @param {Map<string, any>} [parameters] - List of optional argument to pass
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map<string, any>>} Returns as it is the value returned by the transform method recipe.
     * @async
     * @public
     */
    async transform(data: Map<string, any>, logger: SimpleLoggerIntf, parameters: Map<string, any>): Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map<string, any>> {

        // Get data and parameters
        const /** @type {Map<string, SFDC_ObjectType>} */ types: Map<string, SFDC_ObjectType> = data.get(DatasetAliases.OBJECTTYPES);
        const /** @type {Map<string, SFDC_Object>} */ objects: Map<string, SFDC_Object> = data.get(DatasetAliases.OBJECTS);
        const /** @type {Map<string, SFDC_WebLink>} */ weblinks: Map<string, SFDC_WebLink> = data.get(DatasetAliases.WEBLINKS);
        const namespace = OrgCheckGlobalParameter.getPackageName(parameters);
        const objecttype = OrgCheckGlobalParameter.getSObjectTypeName(parameters);
        const object = OrgCheckGlobalParameter.getSObjectName(parameters);

        // Checking data
        if (!types) throw new Error(`RecipeWebLinks: Data from dataset alias 'OBJECTTYPES' was undefined.`);
        if (!objects) throw new Error(`RecipeWebLinks: Data from dataset alias 'OBJECTS' was undefined.`);
        if (!weblinks) throw new Error(`RecipeWebLinks: Data from dataset alias 'WEBLINKS' was undefined.`);

        // Augment and filter data
        /** @type {Array<SFDC_WebLink>} */ 
        const array: Array<SFDC_WebLink> = [];
        await Processor.forEach(weblinks, (/** @type {SFDC_WebLink} */weblink: SFDC_WebLink) => {
            // Augment data
            const objectRef = objects.get(weblink.objectId);
            if (objectRef && !objectRef.typeRef) {
                objectRef.typeRef = types.get(objectRef.typeId);
            }
            weblink.objectRef = objectRef;
            // Filter data
            if ((namespace === OrgCheckGlobalParameter.ALL_VALUES || weblink.package === namespace) &&
                (objecttype === OrgCheckGlobalParameter.ALL_VALUES || weblink.objectRef?.typeRef?.id === objecttype) &&
                (object === OrgCheckGlobalParameter.ALL_VALUES || weblink.objectRef?.apiname === object)) {
                array.push(weblink);
            }
        });

        // Return data
        return array;
    }
}