import { ServedRecipe } from 'src/api/core/recipe/orgcheck-api-recipe';
import { ExportedTable, Table } from 'src/ui/table/orgcheck-ui-table';
import { TableFactory } from 'src/ui/table/orgcheck-ui-table-factory';
import { SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { DatasetRunInformation } from 'src/api/core/dataset/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from 'src/api/core/dataset/orgcheck-api-datasets-aliases';
import { SfdcWebLink }from 'src/api/data/orgcheck-api-data-weblink';
import { Processor } from 'src/api/core/orgcheck-api-processor';
import { SfdcObject }from 'src/api/data/orgcheck-api-data-object';
import { SfdcObjectType }from 'src/api/data/orgcheck-api-data-objecttype';
import { OrgCheckGlobalParameter } from 'src/api/core/orgcheck-api-globalparameter';
import { WebLinksTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-weblinks';

export class RecipeWebLinks implements ServedRecipe<SfdcWebLink[], Table> {

    /**
     * @description Title of this recipe
     * @type {string}
     * @public
     */
    public readonly title: string = '🏑 Web Links';

    /**
     * @description List all ingredients (aka dataset aliases or datasetRunInfos) that Org Check will use in this recipe
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Array<string | DatasetRunInformation>} The ingredients to use in this recipe
     * @public
     */
    public ingredients(_logger: SimpleLoggerIntf): Array<string | DatasetRunInformation> {
        return [
            DatasetAliases.OBJECTTYPES,
            DatasetAliases.OBJECTS,
            DatasetAliases.WEBLINKS
        ];
    }

    /**
     * @description List the parameters that this mix dependes on
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
     * @returns {Promise<SfdcWebLink[]>} Returns the mixture
     * @async
     * @public
     */
    public async mix(ingredients: Map<string, any>, logger: SimpleLoggerIntf, parameters: Map<string, any>): Promise<SfdcWebLink[]> {

        // Get data and parameters
        const types: Map<string, SfdcObjectType> = ingredients.get(DatasetAliases.OBJECTTYPES);
        const objects: Map<string, SfdcObject> = ingredients.get(DatasetAliases.OBJECTS);
        const weblinks: Map<string, SfdcWebLink> = ingredients.get(DatasetAliases.WEBLINKS);
        const namespace = OrgCheckGlobalParameter.getPackageName(parameters);
        const objecttype = OrgCheckGlobalParameter.getSObjectTypeName(parameters);
        const object = OrgCheckGlobalParameter.getSObjectName(parameters);

        // Checking data
        if (!types) throw new Error(`RecipeWebLinks: Data from dataset alias 'OBJECTTYPES' was undefined.`);
        if (!objects) throw new Error(`RecipeWebLinks: Data from dataset alias 'OBJECTS' was undefined.`);
        if (!weblinks) throw new Error(`RecipeWebLinks: Data from dataset alias 'WEBLINKS' was undefined.`);

        // Augment and filter data
        
        const array: SfdcWebLink[] = [];
        await Processor.forEach(weblinks, async (/** @type {SfdcWebLink} */weblink: SfdcWebLink) => {
            // Augment data
            const objectRef = objects.get(weblink.objectId);
            if (objectRef) {
                if (objectRef.typeRef === undefined) {
                    const typeObjectRef = types.get(objectRef.typeId);
                    if (typeObjectRef) {
                        objectRef.typeRef = typeObjectRef;
                    }
                }
                weblink.objectRef = objectRef;
            }
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

    /**
     * @description Process the mixed data into a table format
     * @param {SfdcWebLink[]} mixture - Mixed data to be served to a table
     * @returns {Promise<Table>} The processed view
     * @async
     * @public
     */
    public async serveToTable(mixture: SfdcWebLink[]): Promise<Table> {
        return TableFactory.create(this.title, new WebLinksTableDefinition(), mixture);
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