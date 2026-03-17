import { Recipe } from 'src/api/core/orgcheck-api-recipe';
import { Processor } from 'src/api/core/orgcheck-api-processor';
import { Data } from 'src/api/core/orgcheck-api-data';
import { SimpleLoggerIntf } from 'src/api/core/orgcheck-api-logger';
import { DatasetRunInformation } from 'src/api/core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from 'src/api/core/orgcheck-api-datasets-aliases';
import { SfdcField }from 'src/api/data/orgcheck-api-data-field';
import { SfdcObject }from 'src/api/data/orgcheck-api-data-object';
import { SfdcObjectType }from 'src/api/data/orgcheck-api-data-objecttype';
import { DataMatrixIntf } from 'src/api/core/orgcheck-api-data-matrix';
import { OrgCheckGlobalParameter } from 'src/api/core/orgcheck-api-globalparameter';

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
     * @returns {Promise<Array<Data> | DataMatrixIntf | Data | Map<string, any>>} Returns as it is the value returned by the transform method recipe.
     * @async
     * @public
     */
    async transform(data: Map<string, any>, logger: SimpleLoggerIntf, parameters: Map<string, any>): Promise<Array<Data> | DataMatrixIntf | Data | Map<string, any>> {

        // Get data and parameters
        const /** @type {Map<string, SfdcObjectType>} */ types: Map<string, SfdcObjectType> = data.get(DatasetAliases.OBJECTTYPES);
        const /** @type {Map<string, SfdcObject>} */ objects: Map<string, SfdcObject> = data.get(DatasetAliases.OBJECTS);
        const /** @type {Map<string, SfdcField>} */ customFields: Map<string, SfdcField> = data.get(DatasetAliases.CUSTOMFIELDS);
        const namespace = OrgCheckGlobalParameter.getPackageName(parameters);
        const objecttype = OrgCheckGlobalParameter.getSObjectTypeName(parameters);
        const object = OrgCheckGlobalParameter.getSObjectName(parameters);

        // Checking data
        if (!types) throw new Error(`RecipeCustomFields: Data from dataset alias 'OBJECTTYPES' was undefined.`);
        if (!objects) throw new Error(`RecipeCustomFields: Data from dataset alias 'OBJECTS' was undefined.`);
        if (!customFields) throw new Error(`RecipeCustomFields: Data from dataset alias 'CUSTOMFIELDS' was undefined.`);

        // Augment and filter data
        /** @type {Array<SfdcField>} */
        const array: Array<SfdcField> = [];
        await Processor.forEach(customFields, async (/** @type {SfdcField} */customField: SfdcField) => {
            // Augment data
            const objectRef = objects.get(customField.objectId);
            if (objectRef) {
                if (objectRef.typeRef === undefined) {
                    const typeObjectRef = types.get(objectRef.typeId);
                    if (typeObjectRef) {
                        objectRef.typeRef = typeObjectRef;
                    }
                }
                customField.objectRef = objectRef;
            }
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