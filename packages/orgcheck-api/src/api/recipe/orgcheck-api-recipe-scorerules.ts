import { ServedRecipe } from 'src/api/core/recipe/orgcheck-api-recipe';
import { ExportedTable, Table } from 'src/ui/table/orgcheck-ui-table';
import { TableFactory } from 'src/ui/table/orgcheck-ui-table-factory';
import { MediumProcessor } from 'src/api/core/orgcheck-api-processor';
import { SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { DataMatrixIntf } from 'src/api/core/data/orgcheck-api-data-matrix';
import { DataMatrixFactory } from 'src/api/core/data/orgcheck-api-data-matrix-factory';
import { DatasetRunInformation } from 'src/api/core/dataset/orgcheck-api-dataset-runinformation';
import { ScoreRule } from 'src/orgcheck';
import { ScoreRulesTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-scorerules';
import { SecretSauce } from '../core/orgcheck-api-secretsauce';

export class RecipeScoreRules implements ServedRecipe<DataMatrixIntf, Table> {

    /**
     * @description Title of this recipe
     * @type {string}
     * @public
     */
    public readonly title: string = '⁉️​ Score explanation';

    /**
     * @description List all ingredients (aka dataset aliases or datasetRunInfos) that Org Check will use in this recipe
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Array<string | DatasetRunInformation>} The ingredients to use in this recipe
     * @public
     */
    public ingredients(_logger: SimpleLoggerIntf): Array<string | DatasetRunInformation> {
        return [];
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
     * @returns {Promise<DataMatrixIntf>} Returns the mixture
     * @async
     * @public
     */
    public async mix(): Promise<DataMatrixIntf> {

        // Augment and Filter data
        const workingMatrix = DataMatrixFactory.create();
        await MediumProcessor.forEach(SecretSauce.AllScoreRules, async (rule: ScoreRule) => {
            workingMatrix.setRowHeader(`${rule.id}`, rule);
            rule.applicable.forEach((dataAlias) => {
                workingMatrix.addValueToProperty(
                    `${rule.id}`,
                    dataAlias?.toString() ?? 'N/A', 
                    'true'
                );
            });
        });

        // Return data
        return workingMatrix.toDataMatrix();
    }

    /**
     * @description Process the mixed data into a table format
     * @param {DataMatrixIntf} mixture - Mixed data to be served to a table
     * @returns {Promise<Table>} The processed view
     * @async
     * @public
     */
    public async serveToTable(mixture: DataMatrixIntf): Promise<Table> {
        return TableFactory.create(this.title, new ScoreRulesTableDefinition(mixture), mixture.rows);
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