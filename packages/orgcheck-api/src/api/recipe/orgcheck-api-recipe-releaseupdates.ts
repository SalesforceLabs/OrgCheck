import { ServedRecipe } from 'src/api/core/recipe/orgcheck-api-recipe';
import { SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { DatasetRunInformation } from 'src/api/core/dataset/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from 'src/api/core/dataset/orgcheck-api-datasets-aliases';
import { SfdcReleaseUpdate } from 'src/api/data/orgcheck-api-data-releaseupdate';
import { ExportedTable, Table } from 'src/ui/table/orgcheck-ui-table';
import { TableFactory } from 'src/ui/table/orgcheck-ui-table-factory';
import { ReleaseUpdatesTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-realeseupdates';

export class RecipeReleaseUpdates implements ServedRecipe<SfdcReleaseUpdate[], Table> {
    /**
     * @description Title of this recipe
     * @type {string}
     * @public
     */
    public readonly title: string = '🚨 Release Updates';

    /**
     * @description List all ingredients (aka dataset aliases or datasetRunInfos) that Org Check will use in this recipe
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Array<string | DatasetRunInformation>} The ingredients to use in this recipe
     * @public
     */
    public ingredients(_logger: SimpleLoggerIntf): Array<string | DatasetRunInformation> {
        return [DatasetAliases.RELEASEUPDATES];
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
     * @returns {Promise<SfdcRecordType[]>} Returns the mixture
     * @async
     * @public
     */
    public async mix(ingredients: Map<string, any>, _logger: SimpleLoggerIntf): Promise<SfdcReleaseUpdate[]> {

        // Get data
        const releaseUpdates: Map<string, SfdcReleaseUpdate> = ingredients.get(DatasetAliases.RELEASEUPDATES);

        // Checking data
        if (!releaseUpdates) throw new Error(`RecipeReleaseUpdates: Data from dataset alias 'RELEASEUPDATES' was undefined.`);

        // Return data
        return [...releaseUpdates.values()];
    }

    /**
     * @description Process the mixed data into a table format
     * @param {SfdcReleaseUpdate[]} mixture - Mixed data to be served to a table
     * @returns {Promise<Table>} The processed view
     * @async
     * @public
     */
    public async serveToTable(mixture: SfdcReleaseUpdate[]): Promise<Table> {
        return TableFactory.create(this.title, new ReleaseUpdatesTableDefinition(), mixture);
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