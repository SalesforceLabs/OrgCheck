import { ServedRecipe } from 'src/api/core/recipe/orgcheck-api-recipe';
import { ExportedTable, Table } from 'src/ui/table/orgcheck-ui-table';
import { TableFactory } from 'src/ui/table/orgcheck-ui-table-factory';
import { MediumProcessor } from 'src/api/core/orgcheck-api-processor';
import { SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { DatasetRunInformation } from 'src/api/core/dataset/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from 'src/api/core/dataset/orgcheck-api-datasets-aliases';
import { SfdcValidationRule }from 'src/api/data/orgcheck-api-data-validationrule';
import { SfdcObject }from 'src/api/data/orgcheck-api-data-object';
import { SfdcObjectType }from 'src/api/data/orgcheck-api-data-objecttype';
import { OrgCheckGlobalParameter } from 'src/api/core/orgcheck-api-globalparameter';
import { ValidationRulesTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-validationrules';

export class RecipeValidationRules implements ServedRecipe<SfdcValidationRule[], Table> {

    /**
     * @description Title of this recipe
     * @type {string}
     * @public
     */
    public readonly title: string = '🎾 Validation Rules';

    /**
     * @description List all ingredients (aka dataset aliases or datasetRunInfos) that Org Check will use in this recipe
     * @returns {Array<string | DatasetRunInformation>} The ingredients to use in this recipe
     * @public
     */
    public ingredients(): Array<string | DatasetRunInformation> {
        return [
            DatasetAliases.VALIDATIONRULES,
            DatasetAliases.OBJECTTYPES, 
            DatasetAliases.OBJECTS
        ];
    }

    /**
     * @description List the parameters that this mix depends on on
     * @returns {string[]} List of parameters that this mix dependes on
     * @public
     */
    public mixDependencies(): string[] {
        return [OrgCheckGlobalParameter.PACKAGE_NAME, OrgCheckGlobalParameter.SOBJECT_TYPE_NAME, OrgCheckGlobalParameter.SOBJECT_NAME];
    }

    /**
     * @description mix the ingredients all together and return the result
     * @param {Map<string, any>} ingredients - Records or information grouped by their alias in a Map
     * @param {SimpleLoggerIntf} _logger - Logger
     * @param {Map<string, any>} [parameters] - List of optional argument to pass
     * @returns {Promise<SfdcValidationRule[]>} Returns the mixture
     * @async
     * @public
     */
    public async mix(ingredients: Map<string, unknown>, _logger: SimpleLoggerIntf, parameters: Map<string, string>): Promise<SfdcValidationRule[]> {

        // Get data and parameters
        const types = ingredients.get(DatasetAliases.OBJECTTYPES) as Map<string, SfdcObjectType>;
        const objects = ingredients.get(DatasetAliases.OBJECTS) as Map<string, SfdcObject>;
        const validationRules = ingredients.get(DatasetAliases.VALIDATIONRULES) as Map<string, SfdcValidationRule>;
        const namespace = OrgCheckGlobalParameter.getPackageName(parameters);
        const objecttype = OrgCheckGlobalParameter.getSObjectTypeName(parameters);
        const object = OrgCheckGlobalParameter.getSObjectName(parameters);

        // Checking data
        if (!types) throw new Error(`RecipeValidationRules: Data from dataset alias 'OBJECTTYPES' was undefined.`);
        if (!objects) throw new Error(`RecipeValidationRules: Data from dataset alias 'OBJECTS' was undefined.`);
        if (!validationRules) throw new Error(`RecipeValidationRules: Data from dataset alias 'VALIDATIONRULES' was undefined.`);

        // Augment and filter data
        
        const array: SfdcValidationRule[] = [];
        await MediumProcessor.forEach(validationRules, async (validationRule: SfdcValidationRule) => {
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

    /**
     * @description Process the mixed data into a table format
     * @param {SfdcValidationRule[]} mixture - Mixed data to be served to a table
     * @returns {Promise<Table>} The processed view
     * @async
     * @public
     */
    public async serveToTable(mixture: SfdcValidationRule[]): Promise<Table> {
        return TableFactory.create(this.title, new ValidationRulesTableDefinition(), mixture);
    }

    /**
     * @description We put your plate in a doggy bag
     * @param {Table} plate - Plate which was on the table
     * @returns {Promise<ExportedTable>} Meal in a doggy bag, ready to take back home!
     * @async
     * @public
     */
    public async serveToGo(plate: Table): Promise<ExportedTable> {
        return TableFactory.export(plate);
    }
}