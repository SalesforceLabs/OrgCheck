import { ServedRecipe } from 'src/api/core/recipe/orgcheck-api-recipe';
import { ExportedTable, Table } from 'src/ui/table/orgcheck-ui-table';
import { TableFactory } from 'src/ui/table/orgcheck-ui-table-factory';
import { MediumProcessor } from 'src/api/core/orgcheck-api-processor';
import { SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { DatasetRunInformation } from 'src/api/core/dataset/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from 'src/api/core/dataset/orgcheck-api-datasets-aliases';
import { SfdcPermissionSet }from 'src/api/data/orgcheck-api-data-permissionset';
import { OrgCheckGlobalParameter } from 'src/api/core/orgcheck-api-globalparameter';
import { PermissionSetsTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-permissionsets';

export class RecipePermissionSets implements ServedRecipe<SfdcPermissionSet[], Table> {

    /**
     * @description Title of this recipe
     * @type {string}
     * @public
     */
    public readonly title: string = '🚔 Permission Sets';

    /**
     * @description List all ingredients (aka dataset aliases or datasetRunInfos) that Org Check will use in this recipe
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Array<string | DatasetRunInformation>} The ingredients to use in this recipe
     * @public
     */
    public ingredients(_logger: SimpleLoggerIntf): Array<string | DatasetRunInformation> {
        return [
            DatasetAliases.PERMISSIONSETS
        ];
    }

    /**
     * @description List the parameters that this mix depends on on
     * @returns {string[]} List of parameters that this mix dependes on
     * @public
     */
    public mixDependencies(): string[] {
        return [OrgCheckGlobalParameter.PACKAGE_NAME];
    }

    /**
     * @description mix the ingredients all together and return the result
     * @param {Map<string, any>} ingredients - Records or information grouped by their alias in a Map
     * @param {SimpleLoggerIntf} _logger - Logger
     * @param {Map<string, any>} [parameters] - List of optional argument to pass
     * @returns {Promise<SfdcPermissionSet[]>} Returns the mixture
     * @async
     * @public
     */
    public async mix(ingredients: Map<string, any>, _logger: SimpleLoggerIntf, parameters: Map<string, any>): Promise<SfdcPermissionSet[]> {

        // Get data and parameters
        const permissionSets: Map<string, SfdcPermissionSet> = ingredients.get(DatasetAliases.PERMISSIONSETS);
        const namespace = OrgCheckGlobalParameter.getPackageName(parameters);

        // Checking data
        if (!permissionSets) throw new Error(`RecipePermissionSets: Data from dataset alias 'PERMISSIONSETS' was undefined.`);

        // Augment and Filter data
        const array: SfdcPermissionSet[] = [];
        await MediumProcessor.forEach(permissionSets, async (permissionSet: SfdcPermissionSet) => {
            // Augment data
            const results = await Promise.all([
                MediumProcessor.map(permissionSet.permissionSetIds, (id: string) => permissionSets.get(id)),
                MediumProcessor.map(permissionSet.permissionSetGroupIds, (id: string) => permissionSets.get(id))
            ]);
            permissionSet.permissionSetRefs = results[0]?.filter(n => n !== undefined);
            permissionSet.permissionSetGroupRefs = results[1]?.filter(n => n !== undefined);

            // Filter data
            if (namespace === OrgCheckGlobalParameter.ALL_VALUES || permissionSet.package === namespace) {
                array.push(permissionSet);
            }
        });

        // Return data
        return array;
    }

    /**
     * @description Process the mixed data into a table format
     * @param {SfdcPermissionSet[]} mixture - Mixed data to be served to a table
     * @returns {Promise<Table>} The processed view
     * @async
     * @public
     */
    public async serveToTable(mixture: SfdcPermissionSet[]): Promise<Table> {
        return TableFactory.create(this.title, new PermissionSetsTableDefinition(), mixture);
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