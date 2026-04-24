import { RecipeCollection } from 'src/api/core/recipe/orgcheck-api-recipecollection';
import { SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
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
            RecipeAliases.RELEASE_UPDATES,
            RecipeAliases.REPORTS,
            RecipeAliases.STATIC_RESOURCES,
            RecipeAliases.USER_ROLES,
            RecipeAliases.SHARING_RULES,
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
        const allTableDefinitions: TableDefinition[] = [
            // keep the same order than table returned by ingredients()!
            new ApexClassesTableDefinition(),
            new ApexTestsTableDefinition(),
            new ApexTriggersTableDefinition(),
            new ApexUncompiledTableDefinition(),
            new BrowsersTableDefinition(),
            new ChatterGroupsTableDefinition(),
            new CustomFieldsTableDefinition(),
            new CustomLabelsTableDefinition(),
            new CustomTabsTableDefinition(),
            new DashboardsTableDefinition(),
            new DocumentsTableDefinition(),
            new EmailTemplatesTableDefinition(),
            new FlowsTableDefinition(),
            new HomePageComponentsTableDefinition(),
            new UsersTableDefinition(),
            new KnowledgeArticlesTableDefinition(),
            new AuraComponentsTableDefinition(),
            new FlexiPagesTableDefinition(),
            new LightningWebComponentsTableDefinition(),
            new ObjectsTableDefinition(),
            new PageLayoutsTableDefinition(),
            new PermissionSetsTableDefinition(),
            new PermissionSetLicensesTableDefinition(),
            new ProcessBuildersTableDefinition(),
            new ProfilePasswordPoliciesTableDefinition(),
            new ProfileRestrictionsTableDefinition(),
            new ProfilesTableDefinition(),
            new PublicGroupsTableDefinition(),
            new QueuesTableDefinition(),
            new RecordTypesTableDefinition(),
            new ReleaseUpdatesTableDefinition(),
            new ReportsTableDefinition(),
            new StaticResourcesTableDefinition(),
            new RolesTableDefinition(),
            new SharingRulesTableDefinition(),
            new ValidationRulesTableDefinition(),
            new VisualForceComponentsTableDefinition(),
            new VisualForcePagesTableDefinition(),
            new WebLinksTableDefinition(),
            new WorkflowsTableDefinition()
        ];
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