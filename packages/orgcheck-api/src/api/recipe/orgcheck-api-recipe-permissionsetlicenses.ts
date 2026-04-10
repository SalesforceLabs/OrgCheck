import { ServedRecipe } from 'src/api/core/recipe/orgcheck-api-recipe';
import { ExportedTable, Table } from 'src/ui/table/orgcheck-ui-table';
import { TableFactory } from 'src/ui/table/orgcheck-ui-table-factory';
import { SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { DatasetRunInformation } from 'src/api/core/dataset/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from 'src/api/core/dataset/orgcheck-api-datasets-aliases';
import { SfdcPermissionSetLicense }from 'src/api/data/orgcheck-api-data-permissionsetlicense';
import { SfdcPermissionSet }from 'src/api/data/orgcheck-api-data-permissionset';
import { Processor } from 'src/api/core/orgcheck-api-processor';
import { PermissionSetLicensesTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-permissionsetlicenses';

export class RecipePermissionSetLicenses implements ServedRecipe<SfdcPermissionSetLicense[], Table> {

    /**
     * @description Title of this recipe
     * @type {string}
     * @public
     */
    public readonly title: string = '🚔 Permission Set Licenses';

    /**
     * @description List all ingredients (aka dataset aliases or datasetRunInfos) that Org Check will use in this recipe
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Array<string | DatasetRunInformation>} The ingredients to use in this recipe
     * @public
     */
    public ingredients(_logger: SimpleLoggerIntf): Array<string | DatasetRunInformation> {
        return [
            DatasetAliases.PERMISSIONSETLICENSES,
            DatasetAliases.PERMISSIONSETS
        ];
    }

    /**
     * @description List the parameters that this mix dependes on
     * @returns {string[]} List of parameters that this mix dependes on
     * @public
     */
    public mixDependencies(): string[] {
        return [];
    }

    /**
     * @description mix the ingredients all together and return the result
     * @param {Map<string, any>} ingredients - Records or information grouped by their alias in a Map
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Promise<SfdcPermissionSetLicense[]>} Returns the mixture
     * @async
     * @public
     */
    public async mix(ingredients: Map<string, any>, _logger: SimpleLoggerIntf): Promise<SfdcPermissionSetLicense[]> {

        // Get data
        const permissionSetLicenses: Map<string, SfdcPermissionSetLicense> = ingredients.get(DatasetAliases.PERMISSIONSETLICENSES);
        const permissionSets: Map<string, SfdcPermissionSet> = ingredients.get(DatasetAliases.PERMISSIONSETS);

        // Checking data
        if (!permissionSetLicenses) throw new Error(`RecipePermissionSetLicenses: Data from dataset alias 'PERMISSIONSETLICENSES' was undefined.`);
        if (!permissionSets) throw new Error(`RecipePermissionSetLicenses: Data from dataset alias 'PERMISSIONSETS' was undefined.`);

        // Augment data
        await Processor.forEach(permissionSetLicenses, async (permissionSetLicense: SfdcPermissionSetLicense) => {
            permissionSetLicense.permissionSetRefs = await Processor.map(
                permissionSetLicense.permissionSetIds,
                (id: string) => permissionSets.get(id),
                (id: string) => permissionSets.has(id)
            );
        });

        // Return data
        return [... permissionSetLicenses.values()];
    }

    /**
     * @description Process the mixed data into a table format
     * @param {SfdcPermissionSetLicense[]} mixture - Mixed data to be served to a table
     * @returns {Promise<Table>} The processed view
     * @async
     * @public
     */
    public async serveToTable(mixture: SfdcPermissionSetLicense[]): Promise<Table> {
        return TableFactory.create(this.title, new PermissionSetLicensesTableDefinition(), mixture);
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