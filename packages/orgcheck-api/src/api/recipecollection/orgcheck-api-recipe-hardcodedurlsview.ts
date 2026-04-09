import { RecipeCollection } from 'src/api/core/recipe/orgcheck-api-recipecollection';
import { SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { RecipeAliases } from 'src/api/core/recipe/orgcheck-api-recipes-aliases';
import { SecretSauce } from 'src/api/core/orgcheck-api-secretsauce';
import { DataCollectionStatisticsIntf } from 'src/api/core/data/orgcheck-api-data-datacollectionstats';
import { ExportedTable, Table } from 'src/ui/table/orgcheck-ui-table';
import { TableFactory } from 'src/ui/table/orgcheck-ui-table-factory';
import { ScoreRule } from 'src/api/data/orgcheck-api-data-scorerule';
import { HardCodedURLsTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-hardcodedurls';

export interface HardcodedURLsViewAsTable {
}

export class RecipeHardcodedURLsView implements RecipeCollection {
    
    /**
     * @description Title of this recipe
     * @type {string}
     * @public
     */
    public title: string = '🏖️ Hardcoded URLs view';

    /**
     * @description List the parameters that this recipe collection dependes on
     * @returns {string[]} List of parameters that this recipe collection dependes on
     * @public
     */
    public ingredientsDependencies(): string[] {
        return [];
    }

    /**
     * @description List all recipe aliases that this recipe collection needs
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {RecipeAliases[]} List of recipe aliases that this recipe collection needs
     * @public
     */
    public ingredients(_logger: SimpleLoggerIntf): RecipeAliases[] {
        return [
            RecipeAliases.APEX_CLASSES,
            RecipeAliases.APEX_TRIGGERS,
            RecipeAliases.COLLABORATION_GROUPS,
            RecipeAliases.CUSTOM_FIELDS,
            RecipeAliases.CUSTOM_TABS,
            RecipeAliases.DOCUMENTS,
            RecipeAliases.EMAIL_TEMPLATES,
            RecipeAliases.HOME_PAGE_COMPONENTS,
            RecipeAliases.VALIDATION_RULES,
            RecipeAliases.VISUALFORCE_COMPONENTS,
            RecipeAliases.VISUALFORCE_PAGES,
            RecipeAliases.WEBLINKS
        ];
    }

    /**
     * @description Filter the data items by score rules
     * @returns {ScoreRule[]} List of score rule to filter by. Empty array means no filtering
     * @public
     */ 
    public filterByScoreRules(): ScoreRule[] {
        return SecretSauce.GetScoreRulesForHardCodedURLs();
    }

    /**
     * @description Serve the mixture from a designated recipe collection to a table
     * @param {DataCollectionStatisticsIntf[]} mixture - The mixture
     * @returns {Promise<Table>} The table view of hardcoded URLs
     * @async
     * @public
     */
    public async serveToTable(mixture: DataCollectionStatisticsIntf[]): Promise<Table> {
        return TableFactory.create(
            this.title, 
            new HardCodedURLsTableDefinition(), 
            mixture?.map((item) => ({ 
                name: item.recipeTitle, 
                countBad: item.countBad, 
                countGood: item.countGood, 
                badItems: item.badItems, 
                badValues: item.distinctBadValues ?? [] 
            })) ?? []
        );
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