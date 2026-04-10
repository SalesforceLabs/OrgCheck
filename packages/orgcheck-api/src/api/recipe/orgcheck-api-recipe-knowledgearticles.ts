import { ServedRecipe } from 'src/api/core/recipe/orgcheck-api-recipe';
import { ExportedTable, Table } from 'src/ui/table/orgcheck-ui-table';
import { TableFactory } from 'src/ui/table/orgcheck-ui-table-factory';
import { SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { DatasetRunInformation } from 'src/api/core/dataset/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from 'src/api/core/dataset/orgcheck-api-datasets-aliases';
import { SfdcKnowledgeArticle }from 'src/api/data/orgcheck-api-data-knowledgearticle';
import { KnowledgeArticlesTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-knowledgearticles';

export class RecipeKnowledgeArticles implements ServedRecipe<SfdcKnowledgeArticle[], Table> {

    /**
     * @description Title of this recipe
     * @type {string}
     * @public
     */
    public readonly title: string = '📚 Knowledge Articles';

    /**
     * @description List all ingredients (aka dataset aliases or datasetRunInfos) that Org Check will use in this recipe
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Array<string | DatasetRunInformation>} The ingredients to use in this recipe
     * @public
     */
    public ingredients(_logger: SimpleLoggerIntf): Array<string | DatasetRunInformation> {
        return [DatasetAliases.KNOWLEDGEARTICLES];
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
     * @returns {Promise<SfdcKnowledgeArticle[]>} Returns the mixture
     * @async
     * @public
     */
    public async mix(ingredients: Map<string, any>, _logger: SimpleLoggerIntf): Promise<SfdcKnowledgeArticle[]> {

        // Get data
        const articles: Map<string, SfdcKnowledgeArticle> = ingredients.get(DatasetAliases.KNOWLEDGEARTICLES);

        // Checking data
        if (!articles) throw new Error(`RecipeDocuments: Data from dataset alias 'KNOWLEDGEARTICLES' was undefined.`);

        // Return data
        return [... articles.values()];
    }

    /**
     * @description Process the mixed data into a table format
     * @param {SfdcKnowledgeArticle[]} mixture - Mixed data to be served to a table
     * @returns {Promise<Table>} The processed view
     * @async
     * @public
     */
    public async serveToTable(mixture: SfdcKnowledgeArticle[]): Promise<Table> {
        return TableFactory.create(this.title, new KnowledgeArticlesTableDefinition(), mixture);
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