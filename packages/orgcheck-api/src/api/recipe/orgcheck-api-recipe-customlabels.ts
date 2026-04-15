import { ServedRecipe } from 'src/api/core/recipe/orgcheck-api-recipe';
import { ExportedTable, Table } from 'src/ui/table/orgcheck-ui-table';
import { TableFactory } from 'src/ui/table/orgcheck-ui-table-factory';
import { Processor } from 'src/api/core/orgcheck-api-processor';
import { SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { DatasetRunInformation } from 'src/api/core/dataset/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from 'src/api/core/dataset/orgcheck-api-datasets-aliases';
import { SfdcCustomLabel }from 'src/api/data/orgcheck-api-data-customlabel';
import { OrgCheckGlobalParameter } from 'src/api/core/orgcheck-api-globalparameter';
import { CustomLabelsTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-customlabels';

export class RecipeCustomLabels implements ServedRecipe<SfdcCustomLabel[], Table> {

    /**
     * @description Title of this recipe
     * @type {string}
     * @public
     */
    public readonly title: string = '🥡 Custom Labels';

    /**
     * @description List all ingredients (aka dataset aliases or datasetRunInfos) that Org Check will use in this recipe
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Array<string | DatasetRunInformation>} The ingredients to use in this recipe
     * @public
     */
    public ingredients(_logger: SimpleLoggerIntf): Array<string | DatasetRunInformation> {
        return [DatasetAliases.CUSTOMLABELS];
    }

    /**
     * @description List the parameters that this mix dependes on
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
     * @returns {Promise<SfdcCustomLabel[]>} Returns the mixture
     * @async
     * @public
     */
    public async mix(ingredients: Map<string, any>, _logger: SimpleLoggerIntf, parameters: Map<string, any>): Promise<SfdcCustomLabel[]> {

        // Get data and parameters
        const customLabels: Map<string, SfdcCustomLabel> = ingredients.get(DatasetAliases.CUSTOMLABELS);
        const namespace = OrgCheckGlobalParameter.getPackageName(parameters);

        // Checking data
        if (!customLabels) throw new Error(`RecipeCustomLabels: Data from dataset alias 'CUSTOMLABELS' was undefined.`);

        // Filter data
        const array: SfdcCustomLabel[] = [];
        await Processor.forEach(customLabels, async (customLabel: SfdcCustomLabel) => {
            if (namespace === OrgCheckGlobalParameter.ALL_VALUES || customLabel.package === namespace) {
                array.push(customLabel);
            }
        });

        // Return data
        return array;
    }

    /**
     * @description Process the mixed data into a table format
     * @param {SfdcCustomLabel[]} mixture - Mixed data to be served to a table
     * @returns {Promise<Table>} The processed view
     * @async
     * @public
     */
    public async serveToTable(mixture: SfdcCustomLabel[]): Promise<Table> {
        return TableFactory.create(this.title, new CustomLabelsTableDefinition(), mixture);
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