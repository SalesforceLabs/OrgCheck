import { RecipeCollection } from 'src/api/core/recipe/orgcheck-api-recipecollection';
import { RecipeAliases } from 'src/api/core/recipe/orgcheck-api-recipes-aliases';
import { ScoreRule } from 'src/api/core/orgcheck-api-data-scorerule';
import { DataCollectionStatisticsIntf } from '../core/data/orgcheck-api-data-datacollectionstats';
import { ExportedTable, Table } from 'src/ui/table/orgcheck-ui-table';
import { TableFactory } from 'src/ui/table/orgcheck-ui-table-factory';
import { GlobalViewGlobalTableDefinition, GlobalViewPerRuleTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-globalview';
import { TableDefinition } from 'src/ui/table/orgcheck-ui-table-definition';
import { ApexTestsTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-apextests';
import { ApexClassesTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-apexclasses';
import { ApexTriggersTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-apextriggers';
import { ApexUncompiledTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-apexuncompiled';
import { BrowsersTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-browsers';
import { ChatterGroupsTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-chattergroups';
import { CustomFieldsTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-customfields';
import { CustomLabelsTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-customlabels';
import { CustomTabsTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-customtabs';
import { DashboardsTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-dashboards';
import { DocumentsTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-documents';
import { EmailTemplatesTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-emailtemplates';
import { FlowsTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-flows';
import { HomePageComponentsTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-homepagecomponents';
import { UsersTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-users';
import { KnowledgeArticlesTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-knowledgearticles';
import { AuraComponentsTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-auracomponents';
import { FlexiPagesTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-flexipages';
import { LightningWebComponentsTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-lightningwebcomponents';
import { ObjectsTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-objects';
import { PageLayoutsTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-pagelayouts';
import { PermissionSetsTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-permissionsets';
import { PermissionSetLicensesTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-permissionsetlicenses';
import { ProcessBuildersTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-processbuilders';
import { ProfilePasswordPoliciesTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-profilepwdpolicies';
import { ProfileRestrictionsTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-profilerestrictions';
import { ProfilesTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-profiles';
import { PublicGroupsTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-publicgroups';
import { QueuesTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-queues';
import { RecordTypesTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-recordtypes';
import { ReportsTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-reports';
import { StaticResourcesTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-staticresources';
import { RolesTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-roles';
import { ValidationRulesTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-validationrules';
import { VisualForceComponentsTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-visualforcecomponents';
import { VisualForcePagesTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-visualforcepages';
import { SharingRulesTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-sharingrules';
import { WebLinksTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-weblinks';
import { WorkflowsTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-workflows';
import { ReleaseUpdatesTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-realeseupdates';

const LIST_RECIPES_AND_TABLE_DEFINITIONS = [
    { recipe: RecipeAliases.APEX_CLASSES, tableDefinition: new ApexClassesTableDefinition() },
    { recipe: RecipeAliases.APEX_TESTS, tableDefinition: new ApexTestsTableDefinition() },
    { recipe: RecipeAliases.APEX_TRIGGERS, tableDefinition: new ApexTriggersTableDefinition() },
    { recipe: RecipeAliases.APEX_UNCOMPILED, tableDefinition: new ApexUncompiledTableDefinition() },
    { recipe: RecipeAliases.BROWSERS, tableDefinition: new BrowsersTableDefinition() },
    { recipe: RecipeAliases.COLLABORATION_GROUPS, tableDefinition: new ChatterGroupsTableDefinition() },
    { recipe: RecipeAliases.CUSTOM_FIELDS, tableDefinition: new CustomFieldsTableDefinition() },
    { recipe: RecipeAliases.CUSTOM_LABELS, tableDefinition: new CustomLabelsTableDefinition() },
    { recipe: RecipeAliases.CUSTOM_TABS, tableDefinition: new CustomTabsTableDefinition() },
    { recipe: RecipeAliases.DASHBOARDS, tableDefinition: new DashboardsTableDefinition() },
    { recipe: RecipeAliases.DOCUMENTS, tableDefinition: new DocumentsTableDefinition() },
    { recipe: RecipeAliases.EMAIL_TEMPLATES, tableDefinition: new EmailTemplatesTableDefinition() },
    { recipe: RecipeAliases.FLOWS, tableDefinition: new FlowsTableDefinition() },
    { recipe: RecipeAliases.HOME_PAGE_COMPONENTS, tableDefinition: new HomePageComponentsTableDefinition() },
    { recipe: RecipeAliases.INTERNAL_ACTIVE_USERS, tableDefinition: new UsersTableDefinition() },
    { recipe: RecipeAliases.KNOWLEDGE_ARTICLES, tableDefinition: new KnowledgeArticlesTableDefinition() },
    { recipe: RecipeAliases.LIGHTNING_AURA_COMPONENTS, tableDefinition: new AuraComponentsTableDefinition() },
    { recipe: RecipeAliases.LIGHTNING_PAGES, tableDefinition: new FlexiPagesTableDefinition() },
    { recipe: RecipeAliases.LIGHTNING_WEB_COMPONENTS, tableDefinition: new LightningWebComponentsTableDefinition() },
    { recipe: RecipeAliases.OBJECTS, tableDefinition: new ObjectsTableDefinition() },
    { recipe: RecipeAliases.PAGE_LAYOUTS, tableDefinition: new PageLayoutsTableDefinition() },
    { recipe: RecipeAliases.PERMISSION_SETS, tableDefinition: new PermissionSetsTableDefinition() },
    { recipe: RecipeAliases.PERMISSION_SET_LICENSES, tableDefinition: new PermissionSetLicensesTableDefinition() },
    { recipe: RecipeAliases.PROCESS_BUILDERS, tableDefinition: new ProcessBuildersTableDefinition() },
    { recipe: RecipeAliases.PROFILE_PWD_POLICIES, tableDefinition: new ProfilePasswordPoliciesTableDefinition() },
    { recipe: RecipeAliases.PROFILE_RESTRICTIONS, tableDefinition: new ProfileRestrictionsTableDefinition() },
    { recipe: RecipeAliases.PROFILES, tableDefinition: new ProfilesTableDefinition() },
    { recipe: RecipeAliases.PUBLIC_GROUPS, tableDefinition: new PublicGroupsTableDefinition() },
    { recipe: RecipeAliases.QUEUES, tableDefinition: new QueuesTableDefinition() },
    { recipe: RecipeAliases.RECORD_TYPES, tableDefinition: new RecordTypesTableDefinition() },
    { recipe: RecipeAliases.RELEASE_UPDATES, tableDefinition: new ReleaseUpdatesTableDefinition() },
    { recipe: RecipeAliases.REPORTS, tableDefinition: new ReportsTableDefinition() },
    { recipe: RecipeAliases.STATIC_RESOURCES, tableDefinition: new StaticResourcesTableDefinition() },
    { recipe: RecipeAliases.USER_ROLES, tableDefinition: new RolesTableDefinition() },
    { recipe: RecipeAliases.SHARING_RULES, tableDefinition: new SharingRulesTableDefinition() },
    { recipe: RecipeAliases.VALIDATION_RULES, tableDefinition: new ValidationRulesTableDefinition() },
    { recipe: RecipeAliases.VISUALFORCE_COMPONENTS, tableDefinition: new VisualForceComponentsTableDefinition() },
    { recipe: RecipeAliases.VISUALFORCE_PAGES, tableDefinition: new VisualForcePagesTableDefinition() },
    { recipe: RecipeAliases.WEBLINKS, tableDefinition: new WebLinksTableDefinition() },
    { recipe: RecipeAliases.WORKFLOWS, tableDefinition: new WorkflowsTableDefinition() }
];

export interface GlobalViewAsTable {

    /**
     * @description Name of the exported table (like a title)
     * @type {string}
     * @public
     */
    name: string;

    /**
     * @description Table representing the statistics of good and bad items per type
     * @type {Table}
     * @public
     */
    statisticsGoodAndBad: Table;

    /**
     * @description Table representing the statistics of bad items by reasons (aka rules) and type
     * @type {Table}
     * @public
     */
    statisticsReasons: Table;

    /**
     * @description Details in shape of Table list
     * @type {Table[]}
     * @public
     */
    details: Table[];
}

export class RecipeGlobalView implements RecipeCollection {
    
    /**
     * @description Title of this recipe
     * @type {string}
     * @public
     */
    public readonly title: string = '🏞️ Global view';

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
    public ingredients(): RecipeAliases[] {
        return LIST_RECIPES_AND_TABLE_DEFINITIONS.map(r => r.recipe);
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
        const statsGlobal: { name: string; countBad: number; countGood: number, hadError: boolean }[] = [];
        const statsByRecipeAndRule: { name: string; ruleName: string; countBad: number }[] = [];
        mixture?.forEach((item) => {
            statsGlobal.push({ name: item.recipeTitle, countBad: item.countBad, countGood: item.countGood, hadError: item.hadError });
            item.countBadByRule?.forEach((c) => {
                statsByRecipeAndRule.push({ name: item.recipeTitle, ruleName: c.ruleName, countBad: c.count });
            });
        });
        const allTableDefinitions: TableDefinition[] = LIST_RECIPES_AND_TABLE_DEFINITIONS.map((r) => r.tableDefinition);
        return {
            name: this.title,
            statisticsGoodAndBad: TableFactory.create('Statistics (Good and Bad)', new GlobalViewGlobalTableDefinition(), statsGlobal),
            statisticsReasons: TableFactory.create('Statistics (Reasons)', new GlobalViewPerRuleTableDefinition(), statsByRecipeAndRule),
            details: mixture.map((m, i) => (m.hadError === false) ? TableFactory.create(m.recipeTitle, allTableDefinitions[i], m.allData) : undefined).filter(m => m !== undefined)
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
        const tables = [
            TableFactory.export(plate.statisticsGoodAndBad),
            TableFactory.export(plate.statisticsReasons)
        ];
        // Add as many tabs as details, ordered by the number of bad rows!
        plate.details.sort((a, b) => b.nbBadRows - a.nbBadRows).forEach(detail => tables.push(TableFactory.export(detail)));
        return tables;
    }
}