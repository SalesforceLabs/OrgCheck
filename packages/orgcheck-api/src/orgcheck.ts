import { API } from 'src/api/orgcheck-api-impl';
import { ApiIntf, ApiSetup } from 'src/api/orgcheck-api';

export type { ApiIntf, ApiSetup } from 'src/api/orgcheck-api';
export type { LoggerSetup } from 'src/api/core/orgcheck-api-setup-logger';
export type { StorageSetup } from 'src/api/core/orgcheck-api-setup-storage';
export type { SalesforceManagerSetup, SalesforceAuthenticationOptions } from 'src/api/core/orgcheck-api-setup-salesforcemanager';
export type { Data } from 'src/api/core/orgcheck-api-data';
export type { DataMatrixIntf } from 'src/api/core/orgcheck-api-data-matrix';
export type { SalesforceUsageInformationIntf } from 'src/api/core/orgcheck-api-limit-usageinformation';
export type { RecipeAliases } from 'src/api/core/orgcheck-api-recipes-aliases';
export type { SortOrder } from 'src/ui/table/orgcheck-ui-table-sortorder';
export type { ExportedTable } from 'src/ui/table/orgcheck-ui-table';

export type { ScoreRule } from 'src/api/data/orgcheck-api-data-scorerule';
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

export class ApiFactory {
    public static create(setup: ApiSetup): ApiIntf {
        return new API(setup);
    }
}
