import { ApexClassesTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-apexclasses';
import { ApexTestsTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-apextests';
import { ApexTriggersInObjectTableDefinitions, ApexTriggersTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-apextriggers';
import { ApexUncompiledTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-apexuncompiled';
import { API } from 'src/api/orgcheck-api-impl';
import { ApiIntf, ApiSetup } from 'src/api/orgcheck-api';
import { AppPermissionsTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-objectpermissions';
import { AuraComponentsTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-auracomponents';
import { BrowsersTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-browsers';
import { ChatterGroupsTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-chattergroups';
import { CustomFieldsInObjectTableDefinitions, CustomFieldsTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-customfields';
import { CustomLabelsTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-customlabels';
import { CustomTabsTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-customtabs';
import { DashboardsTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-dashboards';
import { DocumentsTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-documents';
import { EmailTemplatesTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-emailtemplates';
import { ExportedTable, Table } from 'src/ui/table/orgcheck-ui-table';
import { Exporter } from 'src/ui/exporter/orgcheck-ui-exporter';
import { FieldPermissionsTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-fieldpermissions';
import { FieldSetsTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-fieldsets';
import { FlexiPagesInObjectTableDefinitions, FlexiPagesTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-flexipages';
import { FlowsTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-flows';
import { GlobalViewItemsTableDefinitions } from 'src/ui//table/definitions/orgcheck-ui-tabledef-globalview';
import { HardCodedURLsTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-hardcodedurls';
import { HomePageComponentsTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-homepagecomponents';
import { KnowledgeArticlesTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-knowledgearticles';
import { LightningWebComponentsTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-lightningwebcomponents';
import { LimitsTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-limits';
import { ObjectPermissionsTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-apppermissions';
import { ObjectsTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-objects';
import { PageLayoutsTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-pagelayouts';
import { PermissionSetLicensesTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-permissionsetlicenses';
import { PermissionSetsTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-permissionsets';
import { ProcessBuildersTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-processbuilders';
import { ProfilePasswordPoliciesTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-profilepwdpolicies';
import { ProfileRestrictionsTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-profilerestrictions';
import { ProfilesTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-profiles';
import { PublicGroupsTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-publicgroups';
import { QueuesTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-queues';
import { RecordTypesInObjectTableDefinitions, RecordTypesTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-recordtypes';
import { RelationshipsTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-relationships';
import { ReportsTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-reports';
import { RolesTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-roles';
import { Row } from 'src/ui/table/orgcheck-ui-table-row';
import { RowsFactory } from 'src/ui/table/orgcheck-ui-table-rowsfactory';
import { ScoreRule } from 'src/api/core/orgcheck-api-datafactory';
import { ScoreRulesTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-scorerules';
import { SecretSauce } from 'src/api/core/orgcheck-api-secretsauce';
import { SortOrder } from 'src/ui/table/orgcheck-ui-table-sortorder';
import { StandardFieldsTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-standardfields';
import { StaticResourcesTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-staticresources';
import { UsersTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-users';
import { ValidationRulesInObjectTableDefinitions, ValidationRulesTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-validationrules';
import { VisualForceComponentsTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-visualforcecomponents';
import { VisualForcePagesTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-visualforcepages';
import { WebLinksInObjectTableDefinitions, WebLinksTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-weblinks';
import { WorkflowsTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-workflows';
import { DataMatrixIntf } from 'src/api/core/orgcheck-api-data-matrix';
import { RecipeAliases } from 'src/api/core/orgcheck-api-recipes-aliases';
import { Data } from 'src/api/core/orgcheck-api-data';
import { DataCollectionStatisticsIntf } from 'src/api/core/orgcheck-api-data-datacollectionstats';

export type { ApexClassesTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-apexclasses';
export type { ApexTestsTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-apextests';
export type { ApexTriggersInObjectTableDefinitions, ApexTriggersTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-apextriggers';
export type { ApexUncompiledTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-apexuncompiled';
export type { ApiIntf, ApiSetup } from 'src/api/orgcheck-api';
export type { AppPermissionsTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-objectpermissions';
export type { AuraComponentsTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-auracomponents';
export type { BrowsersTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-browsers';
export type { ChatterGroupsTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-chattergroups';
export type { CustomFieldsInObjectTableDefinitions, CustomFieldsTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-customfields';
export type { CustomLabelsTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-customlabels';
export type { CustomTabsTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-customtabs';
export type { DashboardsTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-dashboards';
export type { DataCollectionStatisticsIntf } from 'src/api/core/orgcheck-api-data-datacollectionstats';
export type { DataMatrixIntf } from 'src/api/core/orgcheck-api-data-matrix';
export type { DocumentsTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-documents';
export type { EmailTemplatesTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-emailtemplates';
export type { ExportedTable, Table } from 'src/ui/table/orgcheck-ui-table';
export type { FieldPermissionsTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-fieldpermissions';
export type { FieldSetsTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-fieldsets';
export type { FlexiPagesInObjectTableDefinitions, FlexiPagesTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-flexipages';
export type { FlowsTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-flows';
export type { GlobalViewItemsTableDefinitions } from 'src/ui//table/definitions/orgcheck-ui-tabledef-globalview';
export type { HardCodedURLsTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-hardcodedurls';
export type { HomePageComponentsTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-homepagecomponents';
export type { KnowledgeArticlesTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-knowledgearticles';
export type { LayoutsTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-layouts';
export type { LightningWebComponentsTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-lightningwebcomponents';
export type { LimitsTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-limits';
export type { LoggerSetup } from 'src/api/core/orgcheck-api-setup-logger';
export type { ObjectPermissionsTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-apppermissions';
export type { ObjectsTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-objects';
export type { PageLayoutsTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-pagelayouts';
export type { PermissionSetLicensesTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-permissionsetlicenses';
export type { PermissionSetsTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-permissionsets';
export type { ProcessBuildersTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-processbuilders';
export type { ProfilePasswordPoliciesTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-profilepwdpolicies';
export type { ProfileRestrictionsTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-profilerestrictions';
export type { ProfilesTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-profiles';
export type { PublicGroupsTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-publicgroups';
export type { QueuesTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-queues';
export type { RecordTypesInObjectTableDefinitions, RecordTypesTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-recordtypes';
export type { RelationshipsTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-relationships';
export type { ReportsTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-reports';
export type { RolesTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-roles';
export type { Row } from 'src/ui/table/orgcheck-ui-table-row';
export type { Data } from 'src/api/core/orgcheck-api-data';
export type { SalesforceAuthenticationOptions } from 'src/api/core/orgcheck-api-setup-salesforcemanager';
export type { SalesforceManagerSetup } from 'src/api/core/orgcheck-api-setup-salesforcemanager';
export type { SalesforceUsageInformationIntf } from 'src/api/core/orgcheck-api-limit-usageinformation';
export type { ScoreRule } from 'src/api/core/orgcheck-api-datafactory';
export type { ScoreRulesTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-scorerules';
export type { SfdcApexClass } from 'src/api/data/orgcheck-api-data-apexclass';
export type { SfdcApexTrigger } from 'src/api/data/orgcheck-api-data-apextrigger';
export type { SfdcBrowser } from 'src/api/data/orgcheck-api-data-browser';
export type { SfdcCollaborationGroup } from 'src/api/data/orgcheck-api-data-collaborationgroup';
export type { SfdcCustomLabel } from 'src/api/data/orgcheck-api-data-customlabel';
export type { SfdcCustomTab } from 'src/api/data/orgcheck-api-data-customtab';
export type { SfdcDashboard } from 'src/api/data/orgcheck-api-data-dashboard';
export type { SfdcDocument } from 'src/api/data/orgcheck-api-data-document';
export type { SfdcEmailTemplate } from 'src/api/data/orgcheck-api-data-emailtemplate';
export type { SfdcField } from 'src/api/data/orgcheck-api-data-field';
export type { SfdcFlow } from 'src/api/data/orgcheck-api-data-flow';
export type { SfdcGroup } from 'src/api/data/orgcheck-api-data-group';
export type { SfdcHomePageComponent } from 'src/api/data/orgcheck-api-data-homepagecomponent';
export type { SfdcKnowledgeArticle } from 'src/api/data/orgcheck-api-data-knowledgearticle';
export type { SfdcLightningAuraComponent } from 'src/api/data/orgcheck-api-data-lightningauracomponent';
export type { SfdcLightningPage } from 'src/api/data/orgcheck-api-data-lightningpage';
export type { SfdcLightningWebComponent } from 'src/api/data/orgcheck-api-data-lightningwebcomponent';
export type { SfdcObject } from 'src/api/data/orgcheck-api-data-object';
export type { SfdcObjectType } from 'src/api/data/orgcheck-api-data-objecttype';
export type { SfdcOrganization } from 'src/api/data/orgcheck-api-data-organization';
export type { SfdcPackage } from 'src/api/data/orgcheck-api-data-package';
export type { SfdcPageLayout } from 'src/api/data/orgcheck-api-data-pagelayout';
export type { SfdcPermissionSet } from 'src/api/data/orgcheck-api-data-permissionset';
export type { SfdcPermissionSetLicense } from 'src/api/data/orgcheck-api-data-permissionsetlicense';
export type { SfdcProfile } from 'src/api/data/orgcheck-api-data-profile';
export type { SfdcProfilePasswordPolicy } from 'src/api/data/orgcheck-api-data-profilepasswordpolicy';
export type { SfdcProfileRestrictions } from 'src/api/data/orgcheck-api-data-profilerestrictions';
export type { SfdcRecordType } from 'src/api/data/orgcheck-api-data-recordtype';
export type { SfdcReport } from 'src/api/data/orgcheck-api-data-report';
export type { SfdcStaticResource } from 'src/api/data/orgcheck-api-data-staticresource';
export type { SfdcUser } from 'src/api/data/orgcheck-api-data-user';
export type { SfdcUserRole } from 'src/api/data/orgcheck-api-data-userrole';
export type { SfdcValidationRule } from 'src/api/data/orgcheck-api-data-validationrule';
export type { SfdcVisualForceComponent } from 'src/api/data/orgcheck-api-data-visualforcecomponent';
export type { SfdcVisualForcePage } from 'src/api/data/orgcheck-api-data-visualforcepage';
export type { SfdcWebLink } from 'src/api/data/orgcheck-api-data-weblink';
export type { SfdcWorkflow } from 'src/api/data/orgcheck-api-data-workflow';
export type { SortOrder } from 'src/ui/table/orgcheck-ui-table-sortorder';
export type { StandardFieldsTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-standardfields';
export type { StaticResourcesTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-staticresources';
export type { StorageSetup } from 'src/api/core/orgcheck-api-setup-storage';
export type { UsersTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-users';
export type { ValidationRulesInObjectTableDefinitions, ValidationRulesTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-validationrules';
export type { VisualForceComponentsTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-visualforcecomponents';
export type { VisualForcePagesTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-visualforcepages';
export type { WebLinksTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-weblinks';
export type { WorkflowsTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-workflows';

export type ActionParameter = { namespace: string, type: string, sobject: string };

const cacheStamp_Package = (p: ActionParameter) => (`${p.namespace}`)
const cacheStamp_All = (p: ActionParameter) => (`${p.namespace}-${p.type}-${p.sobject}`)
const cacheStamp_PackageSObject = (p: ActionParameter) => (`${p.namespace}-${p.sobject}`)
const cacheStamp_PackageType = (p: ActionParameter) => (`${p.namespace}-${p.type}`)
const cacheStamp_SObject = (p: ActionParameter) => (`${p.sobject}`)
const cacheStamp_None = () => ('-');

const actions = Object.seal({
    '-welcome-':                 { title: '👋 Welcome!' },
    '-cache-':                   { title: '🛠️ Metadata Cache',                                                                        getter: (api: ApiIntf) => (api.getCacheInformation()),                                                       cacheStamp: cacheStamp_None,            remover: (api: ApiIntf) => (api.removeAllFromCache()) },
    '-score-rules-':             { title: '⁉️ Score explanation',                                                                     getter: (api: ApiIntf) => (api.getAllScoreRulesAsDataMatrix()),                                              cacheStamp: cacheStamp_None,                                                                                                      tables: (dataMatrix: DataMatrixIntf) => ({ main: new ScoreRulesTableDefinitions(dataMatrix) }) },
    'apex-classes':              { title: '❤️‍🔥 Apex Classes',                         recipe: RecipeAliases.APEX_CLASSES,              getter: (api: ApiIntf, p: ActionParameter) => (api.getApexClasses(p.namespace)),                             cacheStamp: cacheStamp_Package,         remover: (api: ApiIntf) => (api.removeAllApexClassesFromCache()),                         tables: () => ({ main: new ApexClassesTableDefinitions() }) },
    'apex-tests':                { title: '🚒 Apex Unit Tests',                      recipe: RecipeAliases.APEX_TESTS,                getter: (api: ApiIntf, p: ActionParameter) => (api.getApexTests(p.namespace)),                               cacheStamp: cacheStamp_Package,         remover: (api: ApiIntf) => (api.removeAllApexTestsFromCache()),                           tables: () => ({ main: new ApexTestsTableDefinitions() }) },
    'apex-triggers':             { title: '🧨 Apex Triggers',                        recipe: RecipeAliases.APEX_TRIGGERS,             getter: (api: ApiIntf, p: ActionParameter) => (api.getApexTriggers(p.namespace)),                            cacheStamp: cacheStamp_Package,         remover: (api: ApiIntf) => (api.removeAllApexTriggersFromCache()),                        tables: () => ({ main: new ApexTriggersTableDefinitions() }) },
    'apex-uncompiled':           { title: '🌋 Apex Classes That Need Recompilation', recipe: RecipeAliases.APEX_UNCOMPILED,           getter: (api: ApiIntf, p: ActionParameter) => (api.getApexUncompiled(p.namespace)),                          cacheStamp: cacheStamp_Package,         remover: (api: ApiIntf) => (api.removeAllApexUncompiledFromCache()),                      tables: () => ({ main: new ApexUncompiledTableDefinitions() }) },
    'app-permissions':           { title: '⛕ Application Permissions',               recipe: RecipeAliases.APP_PERMISSIONS,           getter: (api: ApiIntf, p: ActionParameter) => (api.getApplicationPermissionsPerParent(p.namespace)),         cacheStamp: cacheStamp_Package,         remover: (api: ApiIntf) => (api.removeAllAppPermissionsFromCache()),                     tables: (dataMatrix: DataMatrixIntf) => ({ main: new AppPermissionsTableDefinitions(dataMatrix) }) },
    'browsers':                  { title: '🌐 Browsers',                             recipe: RecipeAliases.BROWSERS,                  getter: (api: ApiIntf) => (api.getBrowsers()),                                                               cacheStamp: cacheStamp_None,            remover: (api: ApiIntf) => (api.removeAllBrowsersFromCache()),                            tables: () => ({ main: new BrowsersTableDefinitions() }) },
    'collaboration-groups':      { title: '🦙 Chatter Groups',                       recipe: RecipeAliases.COLLABORATION_GROUPS,      getter: (api: ApiIntf) => (api.getChatterGroups()),                                                          cacheStamp: cacheStamp_None,            remover: (api: ApiIntf) => (api.removeAllChatterGroupsFromCache()),                       tables: () => ({ main: new ChatterGroupsTableDefinitions() }) },
    'custom-fields':             { title: '🏈 Custom Fields',                        recipe: RecipeAliases.CUSTOM_FIELDS,             getter: (api: ApiIntf, p: ActionParameter) => (api.getCustomFields(p.namespace, p.type, p.sobject)),         cacheStamp: cacheStamp_All,             remover: (api: ApiIntf) => (api.removeAllCustomFieldsFromCache()),                        tables: () => ({ main: new CustomFieldsTableDefinitions() }) },
    'custom-labels':             { title: '🏷️ Custom Labels',                        recipe: RecipeAliases.CUSTOM_LABELS,             getter: (api: ApiIntf, p: ActionParameter) => (api.getCustomLabels(p.namespace)),                            cacheStamp: cacheStamp_Package,         remover: (api: ApiIntf) => (api.removeAllCustomLabelsFromCache()),                        tables: () => ({ main: new CustomLabelsTableDefinitions() }) },
    'custom-tabs':               { title: '🥠 Custom Tabs',                          recipe: RecipeAliases.CUSTOM_TABS,               getter: (api: ApiIntf, p: ActionParameter) => (api.getCustomTabs(p.namespace)),                              cacheStamp: cacheStamp_Package,         remover: (api: ApiIntf) => (api.removeAllCustomTabsFromCache()),                          tables: () => ({ main: new CustomTabsTableDefinitions() }) },
    'dashboards':                { title: '🌲 Dashboards',                           recipe: RecipeAliases.DASHBOARDS,                getter: (api: ApiIntf) => (api.getDashboards()),                                                             cacheStamp: cacheStamp_None,            remover: (api: ApiIntf) => (api.removeAllDashboardsFromCache()),                          tables: () => ({ main: new DashboardsTableDefinitions() }) },
    'documents':                 { title: '🍱 Documents',                            recipe: RecipeAliases.DOCUMENTS,                 getter: (api: ApiIntf, p: ActionParameter) => (api.getDocuments(p.namespace)),                               cacheStamp: cacheStamp_Package,         remover: (api: ApiIntf) => (api.removeAllDocumentsFromCache()),                           tables: () => ({ main: new DocumentsTableDefinitions() }) },
    'email-templates':           { title: '🌇 Email Templates',                      recipe: RecipeAliases.EMAIL_TEMPLATES,           getter: (api: ApiIntf, p: ActionParameter) => (api.getEmailTemplates(p.namespace)),                          cacheStamp: cacheStamp_Package,         remover: (api: ApiIntf) => (api.removeAllEmailTemplatesFromCache()),                      tables: () => ({ main: new EmailTemplatesTableDefinitions() }) },
    'field-permissions':         { title: '🚧 Field Level Securities',               recipe: RecipeAliases.FIELD_PERMISSIONS,         getter: (api: ApiIntf, p: ActionParameter) => (api.getFieldPermissionsPerParent(p.sobject, p.namespace)),    cacheStamp: cacheStamp_PackageSObject,  remover: (api: ApiIntf) => (api.removeAllFieldPermissionsFromCache()),                    tables: (dataMatrix: DataMatrixIntf) => ({ main: new FieldPermissionsTableDefinitions(dataMatrix) }) },
    'flows':                     { title: '🏎️ Flows',                                recipe: RecipeAliases.FLOWS,                     getter: (api: ApiIntf) => (api.getFlows()),                                                                  cacheStamp: cacheStamp_None,            remover: (api: ApiIntf) => (api.removeAllFlowsFromCache()),                               tables: () => ({ main: new FlowsTableDefinitions() }) },
    'global-view':               { title: '🏞️ Overview',                             recipe: RecipeAliases.GLOBAL_VIEW,               getter: (api: ApiIntf) => (api.getGlobalView()),                                                             cacheStamp: cacheStamp_None,            remover: (api: ApiIntf) => (api.removeGlobalViewFromCache()),                             tables: () => ({ main: new GlobalViewItemsTableDefinitions() }) },
    'hardcoded-urls':            { title: '🏖️ Hard coded URLs',                      recipe: RecipeAliases.HARDCODED_URLS_VIEW,       getter: (api: ApiIntf) => (api.getHardcodedURLsView()),                                                      cacheStamp: cacheStamp_None,            remover: (api: ApiIntf) => (api.removeHardcodedURLsFromCache()),                          tables: () => ({ main: new HardCodedURLsTableDefinitions() }) },
    'homepages':                 { title: '🍩 Home Page Components',                 recipe: RecipeAliases.HOME_PAGE_COMPONENTS,      getter: (api: ApiIntf) => (api.getHomePageComponents()),                                                     cacheStamp: cacheStamp_None,            remover: (api: ApiIntf) => (api.removeAllHomePageComponentsFromCache()),                  tables: () => ({ main: new HomePageComponentsTableDefinitions() }) },
    'internal-active-users':     { title: '👥 Active Internal Users',                recipe: RecipeAliases.INTERNAL_ACTIVE_USERS,     getter: (api: ApiIntf) => (api.getActiveUsers()),                                                            cacheStamp: cacheStamp_None,            remover: (api: ApiIntf) => (api.removeAllActiveUsersFromCache()),                         tables: () => ({ main: new UsersTableDefinitions() }) },
    'knowledge-articles':        { title: '📚 Knowledge Articles',                   recipe: RecipeAliases.KNOWLEDGE_ARTICLES,        getter: (api: ApiIntf) => (api.getKnowledgeArticles()),                                                      cacheStamp: cacheStamp_None,            remover: (api: ApiIntf) => (api.removeAllKnowledgeArticlesFromCache()),                   tables: () => ({ main: new KnowledgeArticlesTableDefinitions() }) },
    'lightning-aura-components': { title: '🧁 Lightning Aura Components',            recipe: RecipeAliases.LIGHTNING_AURA_COMPONENTS, getter: (api: ApiIntf, p: ActionParameter) => (api.getLightningAuraComponents(p.namespace)),                 cacheStamp: cacheStamp_Package,         remover: (api: ApiIntf) => (api.removeAllLightningAuraComponentsFromCache()),             tables: () => ({ main: new AuraComponentsTableDefinitions() }) },
    'lightning-pages':           { title: '🎂 Lightning Pages',                      recipe: RecipeAliases.LIGHTNING_PAGES,           getter: (api: ApiIntf, p: ActionParameter) => (api.getLightningPages(p.namespace)),                          cacheStamp: cacheStamp_Package,         remover: (api: ApiIntf) => (api.removeAllLightningPagesFromCache()),                      tables: () => ({ main: new FlexiPagesTableDefinitions() }) },
    'lightning-web-components':  { title: '🍰 Lightning Web Components',             recipe: RecipeAliases.LIGHTNING_WEB_COMPONENTS,  getter: (api: ApiIntf, p: ActionParameter) => (api.getLightningWebComponents(p.namespace)),                  cacheStamp: cacheStamp_Package,         remover: (api: ApiIntf) => (api.removeAllLightningWebComponentsFromCache()),              tables: () => ({ main: new LightningWebComponentsTableDefinitions() }) },
    'object':                    { title: '🎳 Object Documentation',                 recipe: RecipeAliases.OBJECT,                    getter: (api: ApiIntf, p: ActionParameter) => (api.getObject(p.sobject)),                                    cacheStamp: cacheStamp_SObject,         remover: (api: ApiIntf, p: ActionParameter) => (api.removeObjectFromCache(p.sobject)),    tables: () => ({ 'triggers': new ApexTriggersInObjectTableDefinitions(), 
                                                                                                                                                                                                                                                                                                                                                                          'custom-fields': new CustomFieldsInObjectTableDefinitions(), 
                                                                                                                                                                                                                                                                                                                                                                          'field-sets': new FieldSetsTableDefinitions(), 
                                                                                                                                                                                                                                                                                                                                                                          'lightning-pages': new FlexiPagesInObjectTableDefinitions(), 
                                                                                                                                                                                                                                                                                                                                                                          'page-layouts': new PageLayoutsTableDefinitions(), 
                                                                                                                                                                                                                                                                                                                                                                          'limits': new LimitsTableDefinitions(), 
                                                                                                                                                                                                                                                                                                                                                                          'record-types': new RecordTypesInObjectTableDefinitions(),  
                                                                                                                                                                                                                                                                                                                                                                          'relationships': new RelationshipsTableDefinitions(), 
                                                                                                                                                                                                                                                                                                                                                                          'standard-fields': new StandardFieldsTableDefinitions(), 
                                                                                                                                                                                                                                                                                                                                                                          'validation-rules': new ValidationRulesInObjectTableDefinitions(), 
                                                                                                                                                                                                                                                                                                                                                                          'web-links': new WebLinksInObjectTableDefinitions(), 
                                                                                                                                                                                                                                                                                                                                                                          'workflows': new WorkflowsTableDefinitions() }) },
    'objects':                   { title: '🏉 Objects',                              recipe: RecipeAliases.OBJECTS,                   getter: (api: ApiIntf, p: ActionParameter) => (api.getObjects(p.namespace, p.type)),                         cacheStamp: cacheStamp_PackageType,  remover: (api: ApiIntf) => (api.removeAllObjectsFromCache()),                             tables: () => ({ main: new ObjectsTableDefinitions() }) },
    'object-permissions':        { title: '🚦 Object Permissions',                   recipe: RecipeAliases.OBJECT_PERMISSIONS,        getter: (api: ApiIntf, p: ActionParameter) => (api.getObjectPermissionsPerParent(p.namespace)),              cacheStamp: cacheStamp_Package,      remover: (api: ApiIntf) => (api.removeAllObjectPermissionsFromCache()),                   tables: (dataMatrix: DataMatrixIntf) => ({ main: new ObjectPermissionsTableDefinitions(dataMatrix) }) },
    'page-layouts':              { title: '🏓 Page Layouts',                         recipe: RecipeAliases.PAGE_LAYOUTS,              getter: (api: ApiIntf) => (api.getPageLayouts()),                                                            cacheStamp: cacheStamp_None,         remover: (api: ApiIntf) => (api.removeAllPageLayoutsFromCache()),                         tables: () => ({ main: new PageLayoutsTableDefinitions() }) },
    'permission-set-licenses':   { title: '🚔 Permission Set Licenses',              recipe: RecipeAliases.PERMISSION_SET_LICENSES,   getter: (api: ApiIntf) => (api.getPermissionSetLicenses()),                                                  cacheStamp: cacheStamp_None,         remover: (api: ApiIntf) => (api.removeAllPermSetLicensesFromCache()),                     tables: () => ({ main: new PermissionSetLicensesTableDefinitions() }) },
    'permission-sets':           { title: '🚔 Permission Sets',                      recipe: RecipeAliases.PERMISSION_SETS,           getter: (api: ApiIntf, p: ActionParameter) => (api.getPermissionSets(p.namespace)),                          cacheStamp: cacheStamp_Package,      remover: (api: ApiIntf) => (api.removeAllPermSetsFromCache()),                            tables: () => ({ main: new PermissionSetsTableDefinitions() }) },
    'process-builders':          { title: '🛺 Process Builders',                     recipe: RecipeAliases.PROCESS_BUILDERS,          getter: (api: ApiIntf) => (api.getProcessBuilders()),                                                        cacheStamp: cacheStamp_None,         remover: (api: ApiIntf) => (api.removeAllProcessBuildersFromCache()),                     tables: () => ({ main: new ProcessBuildersTableDefinitions() }) },
    'profile-password-policies': { title: '⛖ Profile Password Policies',            recipe: RecipeAliases.PROFILE_PWD_POLICIES,      getter: (api: ApiIntf) => (api.getProfilePasswordPolicies()),                                                cacheStamp: cacheStamp_None,         remover: (api: ApiIntf) => (api.removeAllProfilePasswordPoliciesFromCache()),             tables: () => ({ main: new ProfilePasswordPoliciesTableDefinitions() }) },
    'profile-restrictions':      { title: '🚸 Profile Restrictions',                 recipe: RecipeAliases.PROFILE_RESTRICTIONS,      getter: (api: ApiIntf, p: ActionParameter) => (api.getProfileRestrictions(p.namespace)),                     cacheStamp: cacheStamp_Package,      remover: (api: ApiIntf) => (api.removeAllProfileRestrictionsFromCache()),                 tables: () => ({ main: new ProfileRestrictionsTableDefinitions() }) },
    'profiles':                  { title: '🚓 Profiles',                             recipe: RecipeAliases.PROFILES,                  getter: (api: ApiIntf, p: ActionParameter) => (api.getProfiles(p.namespace)),                                cacheStamp: cacheStamp_Package,      remover: (api: ApiIntf) => (api.removeAllProfilesFromCache()),                            tables: () => ({ main: new ProfilesTableDefinitions() }) },
    'public-groups':             { title: '🐘 Public Groups',                        recipe: RecipeAliases.PUBLIC_GROUPS,             getter: (api: ApiIntf) => (api.getPublicGroups()),                                                           cacheStamp: cacheStamp_None,         remover: (api: ApiIntf) => (api.removeAllPublicGroupsFromCache()),                        tables: () => ({ main: new PublicGroupsTableDefinitions() }) },
    'queues':                    { title: '🦒 Queues',                               recipe: RecipeAliases.QUEUES,                    getter: (api: ApiIntf) => (api.getQueues()),                                                                 cacheStamp: cacheStamp_None,         remover: (api: ApiIntf) => (api.removeAllQueuesFromCache()),                              tables: () => ({ main: new QueuesTableDefinitions() }) },
    'record-types':              { title: '🏏 Record Types',                         recipe: RecipeAliases.RECORD_TYPES,              getter: (api: ApiIntf, p: ActionParameter) => (api.getRecordTypes(p.namespace, p.type, p.sobject)),          cacheStamp: cacheStamp_All,          remover: (api: ApiIntf) => (api.removeAllRecordTypesFromCache()),                         tables: () => ({ main: new RecordTypesTableDefinitions() }) },
    'reports':                   { title: '🌳 Reports',                              recipe: RecipeAliases.REPORTS,                   getter: (api: ApiIntf) => (api.getReports()),                                                                cacheStamp: cacheStamp_None,         remover: (api: ApiIntf) => (api.removeAllReportsFromCache()),                             tables: () => ({ main: new ReportsTableDefinitions() }) },
    'static-resources':          { title: '🗿 Static Resources',                     recipe: RecipeAliases.STATIC_RESOURCES,          getter: (api: ApiIntf, p: ActionParameter) => (api.getStaticResources(p.namespace)),                         cacheStamp: cacheStamp_Package,      remover: (api: ApiIntf) => (api.removeAllStaticResourcesFromCache()),                     tables: () => ({ main: new StaticResourcesTableDefinitions() }) },
    'user-roles-tree':           { title: '🐙 Internal Role Explorer',               recipe: RecipeAliases.USER_ROLES,                getter: (api: ApiIntf) => (api.getRolesTree()),                                                              cacheStamp: cacheStamp_None,         remover: (api: ApiIntf) => (api.removeAllRolesFromCache()) },
    'user-roles':                { title: '🦓 Internal Role Listing',                recipe: RecipeAliases.USER_ROLES,                getter: (api: ApiIntf) => (api.getRoles()),                                                                  cacheStamp: cacheStamp_None,         remover: (api: ApiIntf) => (api.removeAllRolesFromCache()),                               tables: () => ({ main: new RolesTableDefinitions() }) },
    'validation-rules':          { title: '🎾 Validation Rules',                     recipe: RecipeAliases.VALIDATION_RULES,          getter: (api: ApiIntf, p: ActionParameter) => (api.getValidationRules(p.namespace, p.type, p.sobject)),      cacheStamp: cacheStamp_All,          remover: (api: ApiIntf) => (api.removeAllValidationRulesFromCache()),                     tables: () => ({ main: new ValidationRulesTableDefinitions() }) },
    'visualforce-components':    { title: '🍞 Visualforce Components',               recipe: RecipeAliases.VISUALFORCE_COMPONENTS,    getter: (api: ApiIntf, p: ActionParameter) => (api.getVisualForceComponents(p.namespace)),                   cacheStamp: cacheStamp_Package,      remover: (api: ApiIntf) => (api.removeAllVisualForceComponentsFromCache()),               tables: () => ({ main: new VisualForceComponentsTableDefinitions() }) },
    'visualforce-pages':         { title: '🥖 Visualforce Pages',                    recipe: RecipeAliases.VISUALFORCE_PAGES,         getter: (api: ApiIntf, p: ActionParameter) => (api.getVisualForcePages(p.namespace)),                        cacheStamp: cacheStamp_Package,      remover: (api: ApiIntf) => (api.removeAllVisualForcePagesFromCache()),                    tables: () => ({ main: new VisualForcePagesTableDefinitions() }) },
    'web-links':                 { title: '🏑 Web Links',                            recipe: RecipeAliases.WEBLINKS,                  getter: (api: ApiIntf, p: ActionParameter) => (api.getWeblinks(p.namespace, p.type, p.sobject)),             cacheStamp: cacheStamp_All,          remover: (api: ApiIntf) => (api.removeAllWeblinksFromCache()),                            tables: () => ({ main: new WebLinksTableDefinitions() }) },
    'workflows':                 { title: '🚗 Workflows',                            recipe: RecipeAliases.WORKFLOWS,                 getter: (api: ApiIntf) => (api.getWorkflows()),                                                              cacheStamp: cacheStamp_None,         remover: (api: ApiIntf) => (api.removeAllWorkflowsFromCache()),                           tables: () => ({ main: new WorkflowsTableDefinitions() }) },
});

export class ApiFactory {
    public static create(setup: ApiSetup): ApiIntf {
        return new API(setup);
    }
    public static getActionTitle(actionName: string): string {
        return actions[actionName]?.title;
    }
    public static cacheStamp(actionName: string, parameters: ActionParameter): string {
        const method = actions[actionName]?.cacheStamp;
        if (method) return actions[actionName]?.cacheStamp(parameters);
        return '-';
    }
    public static async callGetter(api: ApiIntf, actionName: string, parameters: ActionParameter): Promise<Data | DataMatrixIntf | Data[] | DataCollectionStatisticsIntf[] | undefined> {
        const method = actions[actionName]?.getter
        if (method) return await method(api, parameters);
        return undefined;
    }
    public static callRemover(api: ApiIntf, actionName: string, parameters: ActionParameter): void {
        const method = actions[actionName]?.remover;
        if (method) method(api, parameters);
    }
    public static getTables(actionName: string, data?: DataMatrixIntf): Map<string, Table> {
        const method = actions[actionName]?.tables;
        if (method) {
            const tables = method(data);
            return new Map<string, Table>(Object.keys(tables).map((key: string) => ([ key === 'main' ? actionName : key, tables[key]])));
        }
        return new Map();
    }
}

export class Rules {
    public static get(id: number): ScoreRule {
        return SecretSauce.GetScoreRule(id);
    }
}

export class TableFactory {
    public static createRows(tableDefinition: Table, rows: Array<any>, eachRow: Function, eachCell: Function): Array<Row> { 
        return RowsFactory.create(tableDefinition, rows, eachRow, eachCell); 
    };
    public static createAndExport(tableDefinition: Table, records: Array<any>, title: string): ExportedTable {
        return RowsFactory.createAndExport(tableDefinition, records, title); 
    };
    public static filterRows(rows: Array<Row>, searchInput: string) {
        RowsFactory.filter(rows, searchInput); 
    };
    public static sortRows(tableDefinition: Table, rows: Array<Row>,  columnIndex: number, order: SortOrder) {
        RowsFactory.sort(tableDefinition, rows,  columnIndex, order); 
    };
    public static asXlsx(source: Array<ExportedTable> | ExportedTable): ArrayBuffer {
        return Exporter.exportAsXls(source);    
    }
    public static asRaw(tableDefinition: Table, rows: Array<Row>, title: string): ExportedTable {
        return RowsFactory.export(tableDefinition, rows, title);
    }
}