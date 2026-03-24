import { Recipe } from 'src/api/core/orgcheck-api-recipe';
import { Processor } from 'src/api/core/orgcheck-api-processor';
import { SimpleLoggerIntf } from 'src/api/core/orgcheck-api-logger';
import { DatasetRunInformation } from 'src/api/core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from 'src/api/core/orgcheck-api-datasets-aliases';
import { SfdcValidationRule }from 'src/api/data/orgcheck-api-data-validationrule';
import { SfdcObject }from 'src/api/data/orgcheck-api-data-object';
import { SfdcObjectType }from 'src/api/data/orgcheck-api-data-objecttype';
import { OrgCheckGlobalParameter } from 'src/api/core/orgcheck-api-globalparameter';

export class RecipeValidationRules implements Recipe<SfdcValidationRule[]> {

    /**
     * @description List all dataset aliases (or datasetRunInfos) that this recipe is using
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Array<string | DatasetRunInformation>} The datasets aliases that this recipe is using
     * @public
     */
    extract(_logger: SimpleLoggerIntf): Array<string | DatasetRunInformation> {
        return [
            DatasetAliases.VALIDATIONRULES,
            DatasetAliases.OBJECTTYPES, 
            DatasetAliases.OBJECTS
        ];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map<string, any>} data - Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} logger - Logger
     * @param {Map<string, any>} [parameters] - List of optional argument to pass
     * @returns {Promise<SfdcValidationRule[]>} Returns as it is the value returned by the transform method recipe.
     * @async
     * @public
     */
    async transform(data: Map<string, any>, logger: SimpleLoggerIntf, parameters: Map<string, any>): Promise<SfdcValidationRule[]> {

        // Get data and parameters
        const types: Map<string, SfdcObjectType> = data.get(DatasetAliases.OBJECTTYPES);
        const objects: Map<string, SfdcObject> = data.get(DatasetAliases.OBJECTS);
        const validationRules: Map<string, SfdcValidationRule> = data.get(DatasetAliases.VALIDATIONRULES);
        const namespace = OrgCheckGlobalParameter.getPackageName(parameters);
        const objecttype = OrgCheckGlobalParameter.getSObjectTypeName(parameters);
        const object = OrgCheckGlobalParameter.getSObjectName(parameters);

        // Checking data
        if (!types) throw new Error(`RecipeValidationRules: Data from dataset alias 'OBJECTTYPES' was undefined.`);
        if (!objects) throw new Error(`RecipeValidationRules: Data from dataset alias 'OBJECTS' was undefined.`);
        if (!validationRules) throw new Error(`RecipeValidationRules: Data from dataset alias 'VALIDATIONRULES' was undefined.`);

        // Augment and filter data
        
        const array: Array<SfdcValidationRule> = [];
        await Processor.forEach(validationRules, async (validationRule: SfdcValidationRule) => {
            // Augment
            const objectRef = objects.get(validationRule.objectId);
            if (objectRef) {
                if (objectRef.typeRef === undefined) {
                    const typeObjectRef = types.get(objectRef.typeId);
                    if (typeObjectRef) {
                        objectRef.typeRef = typeObjectRef;
                    }
                }
                validationRule.objectRef = objectRef;
            }
            // Filter
            if ((namespace === OrgCheckGlobalParameter.ALL_VALUES || validationRule.package === namespace) &&
                (objecttype === OrgCheckGlobalParameter.ALL_VALUES || validationRule.objectRef?.typeRef?.id === objecttype) &&
                (object === OrgCheckGlobalParameter.ALL_VALUES || validationRule.objectRef?.apiname === object)) {
                array.push(validationRule);
            }
        });

        // Return data
        return array;
    }
}