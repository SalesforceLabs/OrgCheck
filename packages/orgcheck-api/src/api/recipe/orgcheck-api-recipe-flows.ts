import { ServedRecipe } from 'src/api/core/recipe/orgcheck-api-recipe';
import { ExportedTable, Table } from 'src/ui/table/orgcheck-ui-table';
import { TableFactory } from 'src/ui/table/orgcheck-ui-table-factory';
import { MediumProcessor } from 'src/api/core/orgcheck-api-processor';
import { DatasetRunInformation } from 'src/api/core/dataset/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from 'src/api/core/dataset/orgcheck-api-datasets-aliases';
import { SfdcFlow } from 'src/api/data/orgcheck-api-data-flow';
import { FlowsTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-flows';
import { SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { OrgCheckGlobalParameter } from 'src/api/core/orgcheck-api-globalparameter';

const SEVERITY_ORDER: Record<string, number> = { error: 3, warning: 2, note: 1 };
const meetsMinSeverity = (severity: string, min: string) =>
    !min || min === '*' || (SEVERITY_ORDER[severity] ?? 0) >= (SEVERITY_ORDER[min] ?? 0);

export class RecipeFlows implements ServedRecipe<SfdcFlow[], Table> {

    /**
     * @description Title of this recipe
     * @type {string}
     * @public
     */
    public readonly title: string = '🚙 Flows';

    /**
     * @description List all ingredients (aka dataset aliases or datasetRunInfos) that Org Check will use in this recipe
     * @param {SimpleLoggerIntf} _logger - Logger
     * @param {Map<string, unknown>} parameters - Parameters including LFS options
     * @returns {Array<string | DatasetRunInformation>} The ingredients to use in this recipe
     * @public
     */
    public ingredients(_logger: SimpleLoggerIntf, parameters: Map<string, unknown>): Array<string | DatasetRunInformation> {
        return [new DatasetRunInformation(
            DatasetAliases.FLOWS,
            `${DatasetAliases.FLOWS}-${OrgCheckGlobalParameter.getLfsBetaMode(parameters) ? 'beta' : 'stable'}`,
            new Map([[OrgCheckGlobalParameter.LFS_BETA_MODE, OrgCheckGlobalParameter.getLfsBetaMode(parameters)]])
        )];
    }

    /**
     * @description List the parameters that this mix depends on
     * @returns {string[]} List of parameters that this mix depends on
     * @public
     */
    public mixDependencies(): string[] {
        return [OrgCheckGlobalParameter.LFS_BETA_MODE, OrgCheckGlobalParameter.LFS_MIN_SEVERITY];
    }

    /**
     * @description mix the ingredients all together and return the result
     * @param {Map<string, any>} ingredients - Records or information grouped by their alias in a Map
     * @param {SimpleLoggerIntf} _logger - Logger
     * @param {Map<string, unknown>} parameters - Parameters including LFS severity filter
     * @returns {Promise<SfdcFlow[]>} Returns the mixture
     * @async
     * @public
     */
    public async mix(ingredients: Map<string, unknown>, _logger: SimpleLoggerIntf, parameters: Map<string, unknown>): Promise<SfdcFlow[]> {

        // Get data
        const flows = ingredients.get(DatasetAliases.FLOWS) as Map<string, SfdcFlow>;

        // Checking data and filter
        if (!flows) throw new Error(`RecipeFlows: Data from dataset alias 'FLOWS' was undefined.`);

        const minSeverity = OrgCheckGlobalParameter.getLfsMinSeverity(parameters);

        // Filter data
        const array: SfdcFlow[] = [];
        await MediumProcessor.forEach(flows, async (flow: SfdcFlow) => {
            if (flow.isProcessBuilder === false) {
                // Apply severity filter: keep the flow if it has no LFS violations, or if at least
                // one violation meets the minimum severity threshold
                if (minSeverity === OrgCheckGlobalParameter.LFS_SEVERITY_ALL ||
                    !flow.currentVersionRef?.lfsViolations?.length ||
                    flow.currentVersionRef.lfsViolations.some(v => meetsMinSeverity(v.severity, minSeverity))) {
                    array.push(flow);
                }
            }
        });

        // Return data
        return array;
    }

    /**
     * @description Process the mixed data into a table format
     * @param {SfdcFlow[]} mixture - Mixed data to be served to a table
     * @returns {Promise<Table>} The processed view
     * @async
     * @public
     */
    public async serveToTable(mixture: SfdcFlow[]): Promise<Table> {
        return TableFactory.create(this.title, new FlowsTableDefinition(), mixture);
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