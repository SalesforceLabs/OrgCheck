import { Recipe } from '../core/orgcheck-api-recipe';
import { Processor } from '../core/orgcheck-api-processor';
import { Data, DataWithoutScoring } from '../core/orgcheck-api-data';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { DatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { SFDC_Field } from '../data/orgcheck-api-data-field';
import { SFDC_Object } from '../data/orgcheck-api-data-object';
import { SFDC_ObjectType } from '../data/orgcheck-api-data-objecttype';
import { DataMatrix } from '../core/orgcheck-api-data-matrix';
import { OrgCheckGlobalParameter } from '../core/orgcheck-api-globalparameter';

export class RecipeCustomFields implements Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfos) that this recipe is using
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Array<string | DatasetRunInformation>} The datasets aliases that this recipe is using
     * @public
     */
    extract(_logger: SimpleLoggerIntf): Array<string | DatasetRunInformation> {
        return [
            DatasetAliases.CUSTOMFIELDS, 
            DatasetAliases.OBJECTTYPES, 
            DatasetAliases.OBJECTS
        ];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
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
        const /** @type {Map<string, SFDC_Field>} */ customFields: Map<string, SFDC_Field> = data.get(DatasetAliases.CUSTOMFIELDS);
        const namespace = OrgCheckGlobalParameter.getPackageName(parameters);
        const objecttype = OrgCheckGlobalParameter.getSObjectTypeName(parameters);
        const object = OrgCheckGlobalParameter.getSObjectName(parameters);

        // Checking data
        if (!types) throw new Error(`RecipeCustomFields: Data from dataset alias 'OBJECTTYPES' was undefined.`);
        if (!objects) throw new Error(`RecipeCustomFields: Data from dataset alias 'OBJECTS' was undefined.`);
        if (!customFields) throw new Error(`RecipeCustomFields: Data from dataset alias 'CUSTOMFIELDS' was undefined.`);

        // Augment and filter data
        /** @type {Array<SFDC_Field>} */
        const array: Array<SFDC_Field> = [];
        await Processor.forEach(customFields, (/** @type {SFDC_Field} */customField: SFDC_Field) => {
            // Augment data
            const objectRef = objects.get(customField.objectId);
            if (objectRef && !objectRef.typeRef) {
                objectRef.typeRef = types.get(objectRef.typeId);
            }
            customField.objectRef = objectRef;
            // Filter data
            if ((namespace === OrgCheckGlobalParameter.ALL_VALUES || customField.package === namespace) &&
                (objecttype === OrgCheckGlobalParameter.ALL_VALUES || customField.objectRef?.typeRef?.id === objecttype) &&
                (object === OrgCheckGlobalParameter.ALL_VALUES || customField.objectRef?.apiname === object)) {
                array.push(customField);
            }
        });
        logger?.log(`Done transforming custom fields!`);

        // Return data
        return array;
    }
}