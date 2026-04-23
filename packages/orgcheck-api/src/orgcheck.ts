import { API } from 'src/api/orgcheck-api-impl';
import { ApiIntf, ApiSetup } from 'src/api/orgcheck-api';
import { TableFactory } from 'src/ui/table/orgcheck-ui-table-factory';
import { SortOrder } from 'src/ui/table/orgcheck-ui-table-sortorder';
import { ExportedTable, Table } from 'src/ui/table/orgcheck-ui-table';
import { RecipeAliases } from 'src/api/core/recipe/orgcheck-api-recipes-aliases';
import { SecretSauce } from 'src/api/core/orgcheck-api-secretsauce';
import { ScoreRule } from 'src/api/core/orgcheck-api-data-scorerule';
import { Exporter } from 'src/ui/exporter/orgcheck-ui-exporter';

export type { ApiIntf, ApiSetup } from 'src/api/orgcheck-api';
export type { LoggerSetup } from 'src/api/core/setup/orgcheck-api-setup-logger';
export type { StorageSetup } from 'src/api/core/setup/orgcheck-api-setup-storage';
export type { SalesforceManagerSetup, SalesforceAuthenticationOptions } from 'src/api/core/setup/orgcheck-api-setup-salesforcemanager';
export type { Data, DataWithScore } from 'src/api/core/data/orgcheck-api-data';
export type { DataMatrixIntf } from 'src/api/core/data/orgcheck-api-data-matrix';
export type { DataCollectionStatisticsIntf } from 'src/api/core/data/orgcheck-api-data-datacollectionstats';
export type { SalesforceUsageInformationIntf } from 'src/api/core/salesforce/orgcheck-api-limit-usageinformation';
export type { RecipeAliases } from 'src/api/core/recipe/orgcheck-api-recipes-aliases';
export type { SortOrder } from 'src/ui/table/orgcheck-ui-table-sortorder';
export type { Table, ExportedTable } from 'src/ui/table/orgcheck-ui-table';
export type { SfdcObjectAsTable } from 'src/api/recipe/orgcheck-api-recipe-object';
export type { GlobalViewAsTable } from 'src/api/recipecollection/orgcheck-api-recipe-globalview';

export type { ScoreRule } from 'src/api/core/orgcheck-api-data-scorerule';
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
export type { SfdcReleaseUpdate } from 'src/api/data/orgcheck-api-data-releaseupdate';
export type { SfdcReport } from 'src/api/data/orgcheck-api-data-report';
export type { SfdcStaticResource } from 'src/api/data/orgcheck-api-data-staticresource';
export type { SfdcUser } from 'src/api/data/orgcheck-api-data-user';
export type { SfdcUserRole } from 'src/api/data/orgcheck-api-data-userrole';
export type { SfdcValidationRule } from 'src/api/data/orgcheck-api-data-validationrule';
export type { SfdcVisualForceComponent } from 'src/api/data/orgcheck-api-data-visualforcecomponent';
export type { SfdcVisualForcePage } from 'src/api/data/orgcheck-api-data-visualforcepage';
export type { SfdcSharingRule } from 'src/api/data/orgcheck-api-data-sharingrule';
export type { SfdcWebLink } from 'src/api/data/orgcheck-api-data-weblink';
export type { SfdcWorkflow } from 'src/api/data/orgcheck-api-data-workflow';

export class ApiFactory {
    public static create(setup: ApiSetup): ApiIntf {
        return new API(setup);
    }
}

export const Recipes: typeof RecipeAliases = RecipeAliases;

export class Rules {
    public static get(id: number): ScoreRule | undefined {
        return SecretSauce.GetScoreRule(id);
    }
}

export class TableUtils {
    public static sort(table: Table, columnIndex: number, order: SortOrder): void {
        TableFactory.sort(table, columnIndex, order);
    }
    public static filter(table: Table, searchInput: string): void {
        TableFactory.filter(table, searchInput);
    }
    public static exportAsXls(source: ExportedTable | ExportedTable[]): ArrayBuffer {
        return Exporter.exportAsXls(source);
    }
}