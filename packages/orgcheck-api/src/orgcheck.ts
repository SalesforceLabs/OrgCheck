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
import { LayoutsTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-layouts';
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
import { WebLinksTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-weblinks';
import { WorkflowsTableDefinitions } from 'src/ui/table/definitions/orgcheck-ui-tabledef-workflows';

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

export class ApiFactory {
    public static create(setup: ApiSetup): ApiIntf {
        return new API(setup);
    }
}

export class Rules {
    public static get(id: number): ScoreRule {
        return SecretSauce.GetScoreRule(id);
    }
}

export class TableFactory {
    public static createRows(tableDefintion: Table, rows: Array<any>, eachRow: Function, eachCell: Function): Array<Row> { 
        return RowsFactory.create(tableDefintion, rows, eachRow, eachCell); 
    };
    public static createAndExport(tableDefintion: Table, records: Array<any>, title: string): ExportedTable {
        return RowsFactory.createAndExport(tableDefintion, records, title); 
    };
    public static filterRows(rows: Array<Row>, searchInput: string) {
        RowsFactory.filter(rows, searchInput); 
    };
    public static sortRows(tableDefintion: Table, rows: Array<Row>,  columnIndex: number, order: SortOrder) {
        RowsFactory.sort(tableDefintion, rows,  columnIndex, order); 
    };
    public static asXlsx(source: Array<ExportedTable> | ExportedTable): ArrayBuffer {
        return Exporter.exportAsXls(source);    
    }
    public static asRaw(tableDefintion: Table, rows: Array<Row>, title: string): ExportedTable {
        return RowsFactory.export(tableDefintion, rows, title);
    }
}

export class TableDefinitions {
    static ApexClasses: typeof ApexClassesTableDefinitions = ApexClassesTableDefinitions;
    static ApexTests: typeof ApexTestsTableDefinitions = ApexTestsTableDefinitions;
    static ApexTriggers: typeof ApexTriggersTableDefinitions = ApexTriggersTableDefinitions;
    static ApexTriggersInObject: typeof ApexTriggersInObjectTableDefinitions = ApexTriggersInObjectTableDefinitions;
    static ApexUncompiled: typeof ApexUncompiledTableDefinitions = ApexUncompiledTableDefinitions;
    static AppPermissions: typeof AppPermissionsTableDefinitions = AppPermissionsTableDefinitions;
    static AuraComponents: typeof AuraComponentsTableDefinitions = AuraComponentsTableDefinitions;
    static Browsers: typeof BrowsersTableDefinitions = BrowsersTableDefinitions;
    static ChatterGroups: typeof ChatterGroupsTableDefinitions = ChatterGroupsTableDefinitions;
    static CustomFields: typeof CustomFieldsTableDefinitions = CustomFieldsTableDefinitions;
    static CustomFieldsInObject: typeof CustomFieldsInObjectTableDefinitions = CustomFieldsInObjectTableDefinitions;
    static CustomLabels: typeof CustomLabelsTableDefinitions = CustomLabelsTableDefinitions;
    static CustomTabs: typeof CustomTabsTableDefinitions = CustomTabsTableDefinitions;
    static Dashboards: typeof DashboardsTableDefinitions = DashboardsTableDefinitions;
    static Documents: typeof DocumentsTableDefinitions = DocumentsTableDefinitions;
    static EmailTemplates: typeof EmailTemplatesTableDefinitions = EmailTemplatesTableDefinitions;
    static FieldPermissions: typeof FieldPermissionsTableDefinitions = FieldPermissionsTableDefinitions;
    static FieldSets: typeof FieldSetsTableDefinitions = FieldSetsTableDefinitions;
    static FlexiPages: typeof FlexiPagesTableDefinitions = FlexiPagesTableDefinitions;
    static FlexiPagesInObject: typeof FlexiPagesInObjectTableDefinitions = FlexiPagesInObjectTableDefinitions;
    static Flows: typeof FlowsTableDefinitions = FlowsTableDefinitions;
    static GlobalView: typeof GlobalViewItemsTableDefinitions = GlobalViewItemsTableDefinitions;
    static HardCodedURLs: typeof HardCodedURLsTableDefinitions = HardCodedURLsTableDefinitions;
    static HomePageComponents: typeof HomePageComponentsTableDefinitions = HomePageComponentsTableDefinitions;
    static KnowledgeArticles: typeof KnowledgeArticlesTableDefinitions = KnowledgeArticlesTableDefinitions;
    static Layouts: typeof LayoutsTableDefinitions = LayoutsTableDefinitions;
    static LightningWebComponents: typeof LightningWebComponentsTableDefinitions = LightningWebComponentsTableDefinitions;
    static Limits: typeof LimitsTableDefinitions = LimitsTableDefinitions;
    static ObjectPermissions: typeof ObjectPermissionsTableDefinitions = ObjectPermissionsTableDefinitions;
    static Objects: typeof ObjectsTableDefinitions = ObjectsTableDefinitions;
    static PageLayouts: typeof PageLayoutsTableDefinitions = PageLayoutsTableDefinitions;
    static PermissionSetLicenses: typeof PermissionSetLicensesTableDefinitions = PermissionSetLicensesTableDefinitions;
    static PermissionSets: typeof PermissionSetsTableDefinitions = PermissionSetsTableDefinitions;
    static ProcessBuilders: typeof ProcessBuildersTableDefinitions = ProcessBuildersTableDefinitions;
    static ProfilePasswordPolicies: typeof ProfilePasswordPoliciesTableDefinitions = ProfilePasswordPoliciesTableDefinitions;
    static ProfileRestrictions: typeof ProfileRestrictionsTableDefinitions = ProfileRestrictionsTableDefinitions;
    static Profiles: typeof ProfilesTableDefinitions = ProfilesTableDefinitions;
    static PublicGroups: typeof PublicGroupsTableDefinitions = PublicGroupsTableDefinitions;
    static Queues: typeof QueuesTableDefinitions = QueuesTableDefinitions;
    static RecordTypes: typeof RecordTypesTableDefinitions = RecordTypesTableDefinitions;
    static RecordTypesInObject: typeof RecordTypesInObjectTableDefinitions = RecordTypesInObjectTableDefinitions;
    static Relationships: typeof RelationshipsTableDefinitions = RelationshipsTableDefinitions;
    static Reports: typeof ReportsTableDefinitions = ReportsTableDefinitions;
    static Roles: typeof RolesTableDefinitions = RolesTableDefinitions;
    static ScoreRules: typeof ScoreRulesTableDefinitions = ScoreRulesTableDefinitions;
    static StandardFields: typeof StandardFieldsTableDefinitions = StandardFieldsTableDefinitions;
    static StaticResources: typeof StaticResourcesTableDefinitions = StaticResourcesTableDefinitions;
    static Users: typeof UsersTableDefinitions = UsersTableDefinitions;
    static ValidationRules: typeof ValidationRulesTableDefinitions = ValidationRulesTableDefinitions;
    static ValidationRulesInObject: typeof ValidationRulesInObjectTableDefinitions = ValidationRulesInObjectTableDefinitions;
    static VisualForceComponents: typeof VisualForceComponentsTableDefinitions = VisualForceComponentsTableDefinitions;
    static VisualForcePages: typeof VisualForcePagesTableDefinitions = VisualForcePagesTableDefinitions;
    static WebLinks: typeof WebLinksTableDefinitions = WebLinksTableDefinitions;
    static WebLinksInObject: typeof WebLinksTableDefinitions = WebLinksTableDefinitions;
    static Workflows: typeof WorkflowsTableDefinitions = WorkflowsTableDefinitions;
}
