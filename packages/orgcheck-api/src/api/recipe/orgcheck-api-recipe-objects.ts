import { ServedRecipe } from 'src/api/core/orgcheck-api-recipe';
import { ExportedTable, Table } from 'src/ui/table/orgcheck-ui-table';
import { TableFactory } from 'src/ui/table/orgcheck-ui-table-factory';
import { Processor } from 'src/api/core/orgcheck-api-processor';
import { SimpleLoggerIntf } from 'src/api/core/orgcheck-api-logger';
import { DatasetRunInformation } from 'src/api/core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from 'src/api/core/orgcheck-api-datasets-aliases';
import { SfdcObject }from 'src/api/data/orgcheck-api-data-object';
import { SfdcObjectType }from 'src/api/data/orgcheck-api-data-objecttype';
import { OrgCheckGlobalParameter } from 'src/api/core/orgcheck-api-globalparameter';
import { ObjectsTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-objects';

export class RecipeObjects implements ServedRecipe<SfdcObject[], Table> {

    /**
     * @description Title of this recipe
     * @type {string}
     * @public
     */
    public readonly title: string = '🏉 Objects';

    /**
     * @description List all ingredients (aka dataset aliases or datasetRunInfos) that Org Check will use in this recipe
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Array<string | DatasetRunInformation>} The ingredients to use in this recipe
     * @public
     */
    public ingredients(_logger: SimpleLoggerIntf): Array<string | DatasetRunInformation> {
        return [ DatasetAliases.OBJECTTYPES, DatasetAliases.OBJECTS ];
    }

    /**
     * @description List the parameters that this mix dependes on
     * @returns {string[]} List of parameters that this mix dependes on
     * @public
     */
    public mixDependencies(): string[] {
        return [OrgCheckGlobalParameter.PACKAGE_NAME, OrgCheckGlobalParameter.SOBJECT_TYPE_NAME];
    }

    /**
     * @description mix the ingredients all together and return the result
     * @param {Map<string, any>} ingredients - Records or information grouped by their alias in a Map
     * @param {SimpleLoggerIntf} _logger - Logger
     * @param {Map<string, any>} [parameters] - List of optional argument to pass
     * @returns {Promise<SfdcObject[]>} Returns the mixture
     * @async
     * @public
     */
    public async mix(ingredients: Map<string, any>, _logger: SimpleLoggerIntf, parameters: Map<string, any>): Promise<SfdcObject[]> {

        // Get data and parameters
        const types: Map<string, SfdcObjectType> = ingredients.get(DatasetAliases.OBJECTTYPES);
        const objects: Map<string, SfdcObject> = ingredients.get(DatasetAliases.OBJECTS);
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

    /**
     * @description Process the mixed data into a table format
     * @param {SfdcObject[]} mixture - Mixed data to be served to a table
     * @returns {Promise<Table>} The processed view
     * @async
     * @public
     */
    public async serveToTable(mixture: SfdcObject[]): Promise<Table> {
        return TableFactory.create(this.title, new ObjectsTableDefinition(), mixture);
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