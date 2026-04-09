import { RecipeCollection } from 'src/api/core/recipe/orgcheck-api-recipecollection';
import { SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { RecipeAliases } from 'src/api/core/recipe/orgcheck-api-recipes-aliases';
import { ScoreRule } from 'src/api/core/orgcheck-api-data-scorerule';
import { DataCollectionStatisticsIntf } from '../core/data/orgcheck-api-data-datacollectionstats';
import { ExportedTable, Table } from 'src/ui/table/orgcheck-ui-table';
import { TableFactory } from 'src/ui/table/orgcheck-ui-table-factory';
import { GlobalViewGlobalTableDefinition, GlobalViewPerRuleTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-globalview';

export interface GlobalViewAsTable {
    statisticsGoodAndBad: Table;
    statisticsReasons: Table;
}

export class RecipeGlobalView implements RecipeCollection {
    
    /**
     * @description Title of this recipe
     * @type {string}
     * @public
     */
    public title: string = '🏞️ Global view';

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
            RecipeAliases.APEX_TESTS,
            RecipeAliases.APEX_TRIGGERS,
            RecipeAliases.APEX_UNCOMPILED,
            RecipeAliases.BROWSERS,
            RecipeAliases.COLLABORATION_GROUPS,
            RecipeAliases.CUSTOM_FIELDS,
            RecipeAliases.CUSTOM_LABELS,
            RecipeAliases.CUSTOM_TABS,
            RecipeAliases.DASHBOARDS,
            RecipeAliases.DOCUMENTS,
            RecipeAliases.EMAIL_TEMPLATES,
            RecipeAliases.FLOWS,
            RecipeAliases.HOME_PAGE_COMPONENTS,
            RecipeAliases.INTERNAL_ACTIVE_USERS,
            RecipeAliases.KNOWLEDGE_ARTICLES,
            RecipeAliases.LIGHTNING_AURA_COMPONENTS,
            RecipeAliases.LIGHTNING_PAGES,
            RecipeAliases.LIGHTNING_WEB_COMPONENTS,
            RecipeAliases.OBJECTS,
            RecipeAliases.PAGE_LAYOUTS,
            RecipeAliases.PERMISSION_SETS,
            RecipeAliases.PERMISSION_SET_LICENSES,
            RecipeAliases.PROCESS_BUILDERS,
            RecipeAliases.PROFILE_PWD_POLICIES,
            RecipeAliases.PROFILE_RESTRICTIONS,
            RecipeAliases.PROFILES,
            RecipeAliases.PUBLIC_GROUPS,
            RecipeAliases.QUEUES,
            RecipeAliases.RECORD_TYPES,
            RecipeAliases.REPORTS,
            RecipeAliases.STATIC_RESOURCES,
            RecipeAliases.USER_ROLES,
            RecipeAliases.VALIDATION_RULES,
            RecipeAliases.VISUALFORCE_COMPONENTS,
            RecipeAliases.VISUALFORCE_PAGES,
            RecipeAliases.WEBLINKS,
            RecipeAliases.WORKFLOWS
        ];
    }

    /**
     * @description Filter the data items by score rules
     * @returns {ScoreRule[]} List of score rule to filter by. Empty array means no filtering
     * @public
     */ 
    public filterByScoreRules(): ScoreRule[] {
        return [];
    }

    /**
     * @description Serve the mixture from a designated recipe collection to a table
     * @param {DataCollectionStatisticsIntf[]} mixture - The mixture
     * @returns {Promise<GlobalViewAsTable>} The global view as a table
     * @async
     * @public
     */
    public async serveToTable(mixture: DataCollectionStatisticsIntf[]): Promise<GlobalViewAsTable> {
        const statsGlobal: { name: string; countBad: number; countGood: number }[] = [];
        const statsByRecipeAndRule: { name: string; ruleName: string; countBad: number }[] = [];
        mixture?.forEach((item) => {
            statsGlobal.push({ name: item.recipeTitle, countBad: item.countBad, countGood: item.countGood });
            item.countBadByRule?.forEach((c) => {
                statsByRecipeAndRule.push({ name: item.recipeTitle, ruleName: c.ruleName, countBad: c.count });
            });
        });
        return {
            statisticsGoodAndBad: TableFactory.create('Statistics (Good and Bad)', new GlobalViewGlobalTableDefinition(), statsGlobal),
            statisticsReasons: TableFactory.create('Statistics (Reasons)', new GlobalViewPerRuleTableDefinition(), statsByRecipeAndRule)
        }
    }
    
    /**
     * @description We put your plate in a doggy bag
     * @param {Table[]} plate - Plates which were on the table
     * @returns {Promise<ExportedTable[]>} Meal in a doggy bag, ready to take back home!
     * @async
     * @public
     */
    public async serveToGo(plate: GlobalViewAsTable): Promise<ExportedTable[]> {
        return [
            TableFactory.export(plate.statisticsGoodAndBad),
            TableFactory.export(plate.statisticsReasons)
        ];
    }
}