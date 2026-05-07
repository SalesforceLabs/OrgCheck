import { ServedRecipe } from 'src/api/core/recipe/orgcheck-api-recipe';
import { ExportedTable, Table } from 'src/ui/table/orgcheck-ui-table';
import { TableFactory } from 'src/ui/table/orgcheck-ui-table-factory';
import { DatasetRunInformation } from 'src/api/core/dataset/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from 'src/api/core/dataset/orgcheck-api-datasets-aliases';
import { SfdcBrowser }from 'src/api/data/orgcheck-api-data-browser';
import { BrowsersTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-browsers';

export class RecipeBrowsers implements ServedRecipe<SfdcBrowser[], Table> {

    /**
     * @description Title of this recipe
     * @type {string}
     * @public
     */
    public readonly title: string = '🌐 Browsers';

    /**
     * @description List all ingredients (aka dataset aliases or datasetRunInfos) that Org Check will use in this recipe
     * @returns {Array<string | DatasetRunInformation>} The ingredients to use in this recipe
     * @public
     */
    public ingredients(): Array<string | DatasetRunInformation> {
        return [DatasetAliases.BROWSERS];
    }

    /**
     * @description List the parameters that this mix depends on on
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
     * @returns {Promise<SfdcBrowser[]>} Returns the mixture
     * @async
     * @public
     */
    public async mix(ingredients: Map<string, unknown>): Promise<SfdcBrowser[]> {

        // Get data and parameters
        const browsers = ingredients.get(DatasetAliases.BROWSERS) as Map<string, SfdcBrowser>;

        // Checking data
        if (!browsers) throw new Error(`RecipeBrowsers: Data from dataset alias 'BROWSERS' was undefined.`);

        // Return all data
        return [... browsers.values()];
    }

    /**
     * @description Process the mixed data into a table format
     * @param {SfdcBrowser[]} mixture - Mixed data to be served to a table
     * @returns {Promise<Table>} The processed view
     * @async
     * @public
     */
    public async serveToTable(mixture: SfdcBrowser[]): Promise<Table> {
        return TableFactory.create(this.title, new BrowsersTableDefinition(), mixture);
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