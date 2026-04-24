import { ServedRecipe } from 'src/api/core/recipe/orgcheck-api-recipe';
import { ExportedTable, Table } from 'src/ui/table/orgcheck-ui-table';
import { TableFactory } from 'src/ui/table/orgcheck-ui-table-factory';
import { MediumProcessor } from 'src/api/core/orgcheck-api-processor';
import { SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { DatasetRunInformation } from 'src/api/core/dataset/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from 'src/api/core/dataset/orgcheck-api-datasets-aliases';
import { SfdcField }from 'src/api/data/orgcheck-api-data-field';
import { SfdcObject }from 'src/api/data/orgcheck-api-data-object';
import { SfdcObjectType }from 'src/api/data/orgcheck-api-data-objecttype';
import { OrgCheckGlobalParameter } from 'src/api/core/orgcheck-api-globalparameter';
import { CustomFieldsTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-customfields';

export class RecipeCustomFields implements ServedRecipe<SfdcField[], Table> {

    /**
     * @description Title of this recipe
     * @type {string}
     * @public
     */
    public readonly title: string = '🏈 Custom Fields';

    /**
     * @description List all ingredients (aka dataset aliases or datasetRunInfos) that Org Check will use in this recipe
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Array<string | DatasetRunInformation>} The ingredients to use in this recipe
     * @public
     */
    public ingredients(_logger: SimpleLoggerIntf): Array<string | DatasetRunInformation> {
        return [
            DatasetAliases.CUSTOMFIELDS, 
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
     * @param {SimpleLoggerIntf} logger - Logger
     * @param {Map<string, any>} [parameters] - List of optional argument to pass
     * @returns {Promise<SfdcField[]>} Returns the mixture
     * @async
     * @public
     */
    public async mix(ingredients: Map<string, any>, logger: SimpleLoggerIntf, parameters: Map<string, any>): Promise<SfdcField[]> {

        // Get data and parameters
        const types: Map<string, SfdcObjectType> = ingredients.get(DatasetAliases.OBJECTTYPES);
        const objects: Map<string, SfdcObject> = ingredients.get(DatasetAliases.OBJECTS);
        const customFields: Map<string, SfdcField> = ingredients.get(DatasetAliases.CUSTOMFIELDS);
        const namespace = OrgCheckGlobalParameter.getPackageName(parameters);
        const objecttype = OrgCheckGlobalParameter.getSObjectTypeName(parameters);
        const object = OrgCheckGlobalParameter.getSObjectName(parameters);

        // Checking data
        if (!types) throw new Error(`RecipeCustomFields: Data from dataset alias 'OBJECTTYPES' was undefined.`);
        if (!objects) throw new Error(`RecipeCustomFields: Data from dataset alias 'OBJECTS' was undefined.`);
        if (!customFields) throw new Error(`RecipeCustomFields: Data from dataset alias 'CUSTOMFIELDS' was undefined.`);

        // Augment and filter data
        const array: SfdcField[] = [];
        await MediumProcessor.forEach(customFields, async (customField: SfdcField) => {
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

    /**
     * @description Process the mixed data into a table format
     * @param {SfdcField[]} mixture - Mixed data to be served to a table
     * @returns {Promise<Table>} The processed view
     * @async
     * @public
     */
    public async serveToTable(mixture: SfdcField[]): Promise<Table> {
        return TableFactory.create(this.title, new CustomFieldsTableDefinition(), mixture);
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