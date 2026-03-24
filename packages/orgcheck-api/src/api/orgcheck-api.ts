import { DataMatrixIntf } from 'src/api/core/orgcheck-api-data-matrix';
import { DataCollectionStatisticsIntf } from 'src/api/core/orgcheck-api-data-datacollectionstats';
import { SalesforceUsageInformationIntf } from 'src/api/core/orgcheck-api-limit-usageinformation';
import { LoggerSetup } from 'src/api/core/orgcheck-api-setup-logger';
import { SalesforceManagerSetup } from 'src/api/core/orgcheck-api-setup-salesforcemanager';
import { StorageSetup } from 'src/api/core/orgcheck-api-setup-storage';
import { SfdcApexClass } from 'src/api/data/orgcheck-api-data-apexclass';
import { SfdcApexTrigger } from 'src/api/data/orgcheck-api-data-apextrigger';
import { SfdcBrowser } from 'src/api/data/orgcheck-api-data-browser';
import { SfdcCollaborationGroup } from 'src/api/data/orgcheck-api-data-collaborationgroup';
import { SfdcCustomLabel } from 'src/api/data/orgcheck-api-data-customlabel';
import { SfdcCustomTab } from 'src/api/data/orgcheck-api-data-customtab';
import { SfdcDashboard } from 'src/api/data/orgcheck-api-data-dashboard';
import { SfdcDocument } from 'src/api/data/orgcheck-api-data-document';
import { SfdcEmailTemplate } from 'src/api/data/orgcheck-api-data-emailtemplate';
import { SfdcField } from 'src/api/data/orgcheck-api-data-field';
import { SfdcFlow } from 'src/api/data/orgcheck-api-data-flow';
import { SfdcGroup } from 'src/api/data/orgcheck-api-data-group';
import { SfdcHomePageComponent } from 'src/api/data/orgcheck-api-data-homepagecomponent';
import { SfdcKnowledgeArticle } from 'src/api/data/orgcheck-api-data-knowledgearticle';
import { SfdcLightningAuraComponent } from 'src/api/data/orgcheck-api-data-lightningauracomponent';
import { SfdcLightningPage } from 'src/api/data/orgcheck-api-data-lightningpage';
import { SfdcLightningWebComponent } from 'src/api/data/orgcheck-api-data-lightningwebcomponent';
import { SfdcObject } from 'src/api/data/orgcheck-api-data-object';
import { SfdcObjectType } from 'src/api/data/orgcheck-api-data-objecttype';
import { SfdcOrganization } from 'src/api/data/orgcheck-api-data-organization';
import { SfdcPackage } from 'src/api/data/orgcheck-api-data-package';
import { SfdcPageLayout } from 'src/api/data/orgcheck-api-data-pagelayout';
import { SfdcPermissionSet } from 'src/api/data/orgcheck-api-data-permissionset';
import { SfdcPermissionSetLicense } from 'src/api/data/orgcheck-api-data-permissionsetlicense';
import { SfdcProfile } from 'src/api/data/orgcheck-api-data-profile';
import { SfdcProfilePasswordPolicy } from 'src/api/data/orgcheck-api-data-profilepasswordpolicy';
import { SfdcProfileRestrictions } from 'src/api/data/orgcheck-api-data-profilerestrictions';
import { SfdcRecordType } from 'src/api/data/orgcheck-api-data-recordtype';
import { SfdcReport } from 'src/api/data/orgcheck-api-data-report';
import { SfdcStaticResource } from 'src/api/data/orgcheck-api-data-staticresource';
import { SfdcUser } from 'src/api/data/orgcheck-api-data-user';
import { SfdcUserRole } from 'src/api/data/orgcheck-api-data-userrole';
import { SfdcValidationRule } from 'src/api/data/orgcheck-api-data-validationrule';
import { SfdcVisualForceComponent } from 'src/api/data/orgcheck-api-data-visualforcecomponent';
import { SfdcVisualForcePage } from 'src/api/data/orgcheck-api-data-visualforcepage';
import { SfdcWebLink } from 'src/api/data/orgcheck-api-data-weblink';
import { SfdcWorkflow } from 'src/api/data/orgcheck-api-data-workflow';
import { DataCacheItemIntf } from 'src/api/core/orgcheck-api-cache-item';

export interface ApiSetup { 
    
    /**
     * @description Setup for the logger
     * @type {LoggerSetup}
     * @public
     */
    logSettings: LoggerSetup; 
    
    /**
     * @description Setup for the salesforce manager
     * @type {SalesforceManagerSetup}
     * @public
     */
    salesforce: SalesforceManagerSetup;

    /**
     * @description Setup for the storage
     * @type {StorageSetup}
     * @public
     */
    storage: StorageSetup; 
}

export interface ApiIntf {

    /**
     * @description String representation of the Org Check version in a form of Element [El,n]
     * @type {string}
     * @public
     */
    version: string;

    /**
     * @description Numerical representation of the Salesforce API Version we use
     * @type {number}
     * @public
     */
    salesforceApiVersion: number;

    /** 
     * @description Salesforce ID of the organization
     * @type {string}
     * @public
     */
    orgId: string;

    /**
     * @description Remove all cache from dataset manager
     * @public
     */
    removeAllFromCache(): void;

    /**
     * @description Get cache information from dataset manager
     * @returns {DataCacheItemIntf[]} list of cache information 
     * @public
     */
    getCacheInformation(): DataCacheItemIntf[];

    /**
     * @description Get cache data from dataset manager
     * @param {string} itemName - the name of the cache item to get
     * @returns {any} cached data 
     * @public
     */
    getCacheData(itemName: string): any;

    /**
     * @description Get the list of all Org Check "score rules" as a matrix
     * @returns {DataMatrixIntf} Information about score rules as a matrix
     * @public
     */
    getAllScoreRulesAsDataMatrix(): DataMatrixIntf;

    /**
     * @description Get the lastest Daily API Usage from JSForce, and the level of confidence we have in this ratio to continue using org check.
     * @returns {SalesforceUsageInformationIntf} Percentage of the daily api usage and a confidence precentage.
     * @public
     */
    dailyApiRequestLimitInformation: SalesforceUsageInformationIntf;

    /**
     * @description Send a request to run all tests in the org. When this method is finished, it does not mean all tests are run.
     * @returns {Promise<string>} The Salesforce Id of the AsyncApexJob
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    runAllTestsAsync(): Promise<string>;

    /**
     * @description Compile the given list of Apex Classes and return the status of the compilation
     * @param {string[]} apexClassIds - the list of Apex Class Ids to compile
     * @returns {Promise<Map<string, { isSuccess: boolean, reasons?: string[]}>>} List of results by Apex Class ID
     * @async
     * @public
     */
    compileClasses(apexClassIds: string[]): Promise<Map<string, { isSuccess: boolean; reasons?: string[]; }>>;

    /**
     * @description Get information about the organization
     * @returns {Promise<SfdcOrganization>} Org information to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getOrganizationInformation(): Promise<SfdcOrganization>;

    /**
     * @description Check if we can use the current org according to the terms (specially if this is a production org)
     * @returns {Promise<boolean>} true if this org can be used, false otehrwise.
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    checkUsageTerms(): Promise<boolean>;

    /**
     * @description Returns if the usage terms were accepted manually
     * @returns {boolean} true if the usage terms were accepted manually, false otherwise
     * @public
     */
    wereUsageTermsAcceptedManually(): boolean;

    /**
     * @description Accept manually the usage terms
     * @public
     */
    acceptUsageTermsManually(): void;

    /**
     * @description Check if the current user can run the application
     * @returns {Promise<boolean>} true if this user can run the application. Never returns false (see exception)
     * @throws Exception if not enough permissions to run the application
     * @async
     * @public
     */
    checkCurrentUserPermissions(): Promise<boolean>;

    /**
     * @description Get information about the packages
     * @returns {Promise<SfdcPackage[]>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getPackages(): Promise<SfdcPackage[]>;

    /**
     * @description Remove all the cached information about packages
     * @public
     */
    removeAllPackagesFromCache(): void;

    /**
     * @description Get information about the page layouts
     * @param {string} [namespace] - the namespace of the package to filter the page layouts
     * @param {string} [sobjectType] - the sobject type to filter the page layouts
     * @param {string} [sobject] - the sobject to filter the page layouts
     * @returns {Promise<SfdcPageLayout[]>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getPageLayouts(namespace?: string, sobjectType?: string, sobject?: string): Promise<SfdcPageLayout[]>;

    /**
     * @description Remove all the cached information about page layouts
     * @public
     */
    removeAllPageLayoutsFromCache(): void;

    /**
     * @description Get information about the object types
     * @returns {Promise<SfdcObjectType[]>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getObjectTypes(): Promise<SfdcObjectType[]>;

    /**
     * @description Get information about the objects 
     * @param {string} [namespace] - the namespace of the package to filter the objects
     * @param {string} [sobjectType] - the sobject type to filter the objects
     * @returns {Promise<SfdcObject[]>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getObjects(namespace?: string, sobjectType?: string): Promise<SfdcObject[]>;

    /**
     * @description Remove all the cached information about objects
     * @public
     */
    removeAllObjectsFromCache(): void;

    /**
     * @description Get information about a specific sobject
     * @param {string} sobject - the name of the sobject to get information about
     * @returns {Promise<SfdcObject>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getObject(sobject: string): Promise<SfdcObject>;

    /**
     * @description Remove all the cached information about a specific sobject
     * @param {string} sobject - the name of the sobject to remove from cache
     * @public
     */
    removeObjectFromCache(sobject: string): void;

    /**
     * @description Get information about object permissions per parent (kind of matrix view)
     * @param {string} [namespace] - the namespace of the package to filter the object permissions
     * @returns {Promise<DataMatrixIntf>} Information about objects (list of string) and permissions (list of SfdcObjectPermissionsPerParent)
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getObjectPermissionsPerParent(namespace?: string): Promise<DataMatrixIntf>;

    /**
     * @description Remove all the cached information about object permissions
     * @public
     */
    removeAllObjectPermissionsFromCache(): void;

    /**
     * @description Get information about application permissions per parent (kind of matrix view)
     * @param {string} [namespace] - the namespace of the package to filter the application permissions
     * @returns {Promise<DataMatrixIntf>} Information about applications (list of string) and permissions (list of SfdcAppPermissionsPerParent)
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getApplicationPermissionsPerParent(namespace?: string): Promise<DataMatrixIntf>;

    /**
     * @description Remove all the cached information about application permissions
     * @public
     */
    removeAllAppPermissionsFromCache(): void;

    /**
     * @description Get information about knowledge articles
     * @returns {Promise<SfdcKnowledgeArticle[]>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getKnowledgeArticles(): Promise<SfdcKnowledgeArticle[]>;

    /**
     * @description Remove all the cached information about knowledge articles
     * @public
     */
    removeAllKnowledgeArticlesFromCache(): void;

    /**
     * @description Get information about Chatter groups
     * @returns {Promise<SfdcCollaborationGroup[]>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getChatterGroups(): Promise<SfdcCollaborationGroup[]>;

    /**
     * @description Remove all the cached information about Chatter groups
     * @public
     */
    removeAllChatterGroupsFromCache(): void;

    /**
     * @description Get information about custom fields (filtered out by namespace/pakage, type and sobject)
     * @param {string} [namespace] - the namespace of the package to filter the custom fields
     * @param {string} [sobjectType] - the sobject type to filter the custom fields
     * @param {string} [sobject] - the sobject to filter the custom fields
     * @returns {Promise<SfdcField[]>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getCustomFields(namespace?: string, sobjectType?: string, sobject?: string): Promise<SfdcField[]>;

    /**
     * @description Remove all the cached information about custom fields
     * @public
     */
    removeAllCustomFieldsFromCache(): void;

    /**
     * @description Get information about permission sets (filtered out by namespace/pakage)
     * @param {string} [namespace] - the namespace of the package to filter the permission sets
     * @returns {Promise<SfdcPermissionSet[]>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getPermissionSets(namespace?: string): Promise<SfdcPermissionSet[]> ;
    
    /**
     * @description Remove all the cached information about permission sets
     * @public
     */
    removeAllPermSetsFromCache(): void;

    /**
     * @description Get information about permission set licenses
     * @returns {Promise<SfdcPermissionSetLicense[]>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getPermissionSetLicenses(): Promise<SfdcPermissionSetLicense[]>;
    
    /**
     * @description Remove all the cached information about permission set licenses
     * @public
     */
    removeAllPermSetLicensesFromCache(): void;

    /**
     * @description Get information about profiles (filtered out by namespace/pakage)
     * @param {string} [namespace] - the namespace of the package to filter the profiles
     * @returns {Promise<SfdcProfile[]>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getProfiles(namespace?: string): Promise<SfdcProfile[]>;

    /**
     * @description Remove all the cached information about profiles
     * @public
     */
    removeAllProfilesFromCache(): void;

    /**
     * @description Get information about profile restrictions (filtered out by namespace/pakage)
     * @param {string} [namespace] - the namespace of the package to filter the profile restrictions
     * @returns {Promise<SfdcProfileRestrictions[]>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getProfileRestrictions(namespace?: string): Promise<SfdcProfileRestrictions[]>;

    /**
     * @description Remove all the cached information about profile restrictions
     * @public
     */
    removeAllProfileRestrictionsFromCache(): void;

    /**
     * @description Get information about profile password policies
     * @returns {Promise<SfdcProfilePasswordPolicy[]>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getProfilePasswordPolicies(): Promise<SfdcProfilePasswordPolicy[]>;

    /**
     * @description Remove all the cached information about profile password policies
     * @public
     */
    removeAllProfilePasswordPoliciesFromCache(): void;

    /**
     * @description Get information about active users
     * @returns {Promise<SfdcUser[]>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getActiveUsers(): Promise<SfdcUser[]>;

    /**
     * @description Remove all the cached information about active users
     * @public
     */
    removeAllActiveUsersFromCache(): void;

    /**
     * @description Get information about browsers
     * @returns {Promise<SfdcBrowser[]>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getBrowsers(): Promise<SfdcBrowser[]>;

    /**
     * @description Remove all the cached information about browsers
     * @public
     */
    removeAllBrowsersFromCache(): void;

    /**
     * @description Get information about custom labels (filtered out by namespace/pakage)
     * @param {string} [namespace] - the namespace of the package to filter the custom labels
     * @returns {Promise<SfdcCustomLabel[]>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getCustomLabels(namespace?: string): Promise<SfdcCustomLabel[]>;

    /**
     * @description Remove all the cached information about custom labels
     * @public
     */
    removeAllCustomLabelsFromCache(): void;

    /**
     * @description Get information about custom tabs (filtered out by namespace/pakage)
     * @param {string} [namespace] - the namespace of the package to filter the custom tabs
     * @returns {Promise<SfdcCustomTab[]>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getCustomTabs(namespace?: string): Promise<SfdcCustomTab[]>;

    /**
     * @description Remove all the cached information about custom tabs
     * @public
     */
    removeAllCustomTabsFromCache(): void;

    /**
     * @description Get information about documents (filtered out by namespace/pakage)
     * @param {string} [namespace] - the namespace of the package to filter the documents
     * @returns {Promise<SfdcDocument[]>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getDocuments(namespace?: string): Promise<SfdcDocument[]>;

    /**
     * @description Remove all the cached information about documents
     * @public
     */
    removeAllDocumentsFromCache(): void;
    
    /**
     * @description Get information about LWCs (filtered out by namespace/pakage)
     * @param {string} [namespace] - the namespace of the package to filter the lightning web components
     * @returns {Promise<SfdcLightningWebComponent[]>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getLightningWebComponents(namespace?: string): Promise<SfdcLightningWebComponent[]>;
    
    /**
     * @description Remove all the cached information about lightning web components
     * @public
     */
    removeAllLightningWebComponentsFromCache(): void;

    /**
     * @description Get information about Aura Components (filtered out by namespace/pakage)
     * @param {string} [namespace] - the namespace of the package to filter the lightning aura components
     * @returns {Promise<SfdcLightningAuraComponent[]>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getLightningAuraComponents(namespace?: string): Promise<SfdcLightningAuraComponent[]>;

    /**
     * @description Remove all the cached information about lightning aura components
     * @public
     */
    removeAllLightningAuraComponentsFromCache(): void;

    /**
     * @description Get information about flexipages (filtered out by namespace/pakage)
     * @param {string} [namespace] - the namespace of the package to filter the lightning pages
     * @returns {Promise<SfdcLightningPage[]>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getLightningPages(namespace?: string): Promise<SfdcLightningPage[]>;

    /**
     * @description Remove all the cached information about lightning pages
     * @public
     */
    removeAllLightningPagesFromCache(): void;
    
    /**
     * @description Get information about VFCs (filtered out by namespace/pakage)
     * @param {string} [namespace] - the namespace of the package to filter the visualforce components
     * @returns {Promise<SfdcVisualForceComponent[]>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getVisualForceComponents(namespace?: string): Promise<SfdcVisualForceComponent[]>;
    
    /**
     * @description Remove all the cached information about Visualforce Components
     * @public
     */
    removeAllVisualForceComponentsFromCache(): void;

    /**
     * @description Get information about VFPs (filtered out by namespace/pakage)
     * @param {string} [namespace] - the namespace of the package to filter the visualforce pages
     * @returns {Promise<SfdcVisualForcePage[]>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getVisualForcePages(namespace?: string): Promise<SfdcVisualForcePage[]>;

    /**
     * @description Remove all the cached information about Visualforce Pages
     * @public
     */
    removeAllVisualForcePagesFromCache(): void;
    
    /**
     * @description Get information about Public Groups
     * @returns {Promise<SfdcGroup[]>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getPublicGroups(): Promise<SfdcGroup[]>;

    /**
     * @description Remove all the cached information about public groups
     * @public
     */
    removeAllPublicGroupsFromCache(): void;

    /**
     * @description Get information about Queues
     * @returns {Promise<SfdcGroup[]>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getQueues(): Promise<SfdcGroup[]>;

    /**
     * @description Remove all the cached information about queues
     * @public
     */
    removeAllQueuesFromCache(): void;

    /**
     * @description Get information about Apex Classes (filtered out by namespace/pakage)
     * @param {string} [namespace] - the namespace of the package to filter the apex classes
     * @returns {Promise<SfdcApexClass[]>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getApexClasses(namespace?: string): Promise<SfdcApexClass[]>;

    /**
     * @description Remove all the cached information about apex classes
     * @public
     */
    removeAllApexClassesFromCache(): void;

    /**
     * @description Get information about Apex Tests (filtered out by namespace/pakage)
     * @param {string} [namespace] - the namespace of the package to filter the apex tests
     * @returns {Promise<SfdcApexClass[]>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getApexTests(namespace?: string): Promise<SfdcApexClass[]>;

    /**
     * @description Remove all the cached information about apex tests
     * @public
     */
    removeAllApexTestsFromCache(): void;

    /**
     * @description Get information about Apex Uncompiled Classes (filtered out by namespace/pakage)
     * @param {string} [namespace] - the namespace of the package to filter the apex uncompiled classes
     * @returns {Promise<SfdcApexClass[]>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getApexUncompiled(namespace?: string): Promise<SfdcApexClass[]>;

    /**
     * @description Remove all the cached information about apex uncompiled classes
     * @public
     */
    removeAllApexUncompiledFromCache(): void;

    /**
     * @description Get information about Apex triggers (filtered out by namespace/pakage)
     * @param {string} [namespace] - the namespace of the package to filter the apex triggers
     * @returns {Promise<SfdcApexTrigger[]>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getApexTriggers(namespace?: string): Promise<SfdcApexTrigger[]>;

    /**
     * @description Remove all the cached information about apex triggers
     * @public
     */
    removeAllApexTriggersFromCache(): void;

    /**
     * @description Get information about User roles in a tabular view
     * @returns {Promise<SfdcUserRole[]>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getRoles(): Promise<SfdcUserRole[]>;

    /**
     * @description Remove all the cached information about roles
     * @public
     */
    removeAllRolesFromCache(): void;

    /**
     * @description Get information about User Roles in a tree view
     * @returns {Promise<SfdcUserRole>} Tree
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getRolesTree(): Promise<SfdcUserRole>;

    /**
     * @description Get information about Static Resources
     * @param {string} [namespace] - the namespace of the package to filter the weblinks
     * @returns {Promise<SfdcStaticResource[]>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getStaticResources(namespace?: string): Promise<SfdcStaticResource[]>;

    /**
     * @description Remove all the cached information about Static Resources
     * @public
     */
    removeAllStaticResourcesFromCache(): void;

    /**
     * @description Get information about WebLinks
     * @param {string} [namespace] - the namespace of the package to filter the weblinks
     * @param {string} [sobjectType] - the sobject type to filter the weblinks
     * @param {string} [sobject] - the sobject to filter the weblinks
     * @returns {Promise<SfdcWebLink[]>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getWeblinks(namespace?: string, sobjectType?: string, sobject?: string): Promise<SfdcWebLink[]>;

    /**
     * @description Remove all the cached information about WebLinks
     * @public
     */
    removeAllWeblinksFromCache(): void;

    /**
     * @description Get information about Workflows
     * @returns {Promise<SfdcWorkflow[]>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getWorkflows(): Promise<SfdcWorkflow[]>;

    /**
     * @description Remove all the cached information about workflows
     * @public
     */
    removeAllWorkflowsFromCache(): void;

    /**
     * @description Get information about record types
     * @param {string} [namespace] - the namespace of the package to filter the record types
     * @param {string} [sobjectType] - the sobject type to filter the record types
     * @param {string} [sobject] - the sobject to filter the record types
     * @returns {Promise<SfdcRecordType[]>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getRecordTypes(namespace?: string, sobjectType?: string, sobject?: string): Promise<SfdcRecordType[]>;

    /**
     * @description Remove all the cached information about record types
     * @public
     */
    removeAllRecordTypesFromCache(): void;

    /**
     * @description Get information about field permissions per parent (kind of matrix view) for a specific sobject
     * @param {string} sobject - the name of the sobject to get information about
     * @param {string} [namespace] - the namespace of the package to filter the field permissions
     * @returns {Promise<DataMatrixIntf>} Information about fields (list of string) and permissions (list of SfdcFieldPermissionsPerParent)
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getFieldPermissionsPerParent(sobject: string, namespace?: string): Promise<DataMatrixIntf>;

    /**
     * @description Remove all the cached information about field permissions
     * @public
     */
    removeAllFieldPermissionsFromCache(): void;

    /**
     * @description Get information about Flows
     * @returns {Promise<SfdcFlow[]>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getFlows(): Promise<SfdcFlow[]>;

    /**
     * @description Remove all the cached information about flows
     * @public
     */
    removeAllFlowsFromCache(): void;
    
    /**
     * @description Get information about EmailTemplate
     * @param {string} [namespace] - the namespace of the package to filter the email templates
     * @returns {Promise<SfdcEmailTemplate[]>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getEmailTemplates(namespace?: string): Promise<SfdcEmailTemplate[]>;

    /**
     * @description Remove all the cached information about email template
     * @public
     */
    removeAllEmailTemplatesFromCache(): void;

    /**
     * @description Get information about home page components
     * @returns {Promise<SfdcHomePageComponent[]>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getHomePageComponents(): Promise<SfdcHomePageComponent[]>;

    /**
     * @description Remove all the cached information about home page components
     * @public
     */
    removeAllHomePageComponentsFromCache(): void;

    /**
     * @description Get information about Process Builders
     * @returns {Promise<SfdcFlow[]>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getProcessBuilders(): Promise<SfdcFlow[]>;

    /**
     * @description Remove all the cached information about process builders
     * @public
     */
    removeAllProcessBuildersFromCache(): void;
    
    /**
     * @description Get information about Validation rules
     * @param {string} [namespace] - the namespace of the package to filter the validation rules
     * @param {string} [sobjectType] - the sobject type to filter the validation rules
     * @param {string} [sobject] - the sobject to filter the validation rules
     * @returns {Promise<SfdcValidationRule[]>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getValidationRules(namespace?: string, sobjectType?: string, sobject?: string): Promise<SfdcValidationRule[]>;
    
    /**
     * @description Remove all the cached information about validation rules
     * @public
     */
    removeAllValidationRulesFromCache(): void;

    /**
     * @description Get information about dashboards
     * @returns {Promise<SfdcDashboard[]>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getDashboards(): Promise<SfdcDashboard[]>;
    
    /**
     * @description Remove all the cached information about dashboards
     * @public
     */
    removeAllDashboardsFromCache(): void;

    /**
     * @description Get information about reports
     * @returns {Promise<SfdcReport[]>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getReports(): Promise<SfdcReport[]>;
    
    /**
     * @description Remove all the cached information about reports
     * @public
     */
    removeAllReportsFromCache(): void;

    /**
     * @description Get global view of the org
     * @returns {Promise<DataCollectionStatisticsIntf[]>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getGlobalView(): Promise<DataCollectionStatisticsIntf[]>;

    /**
     * @description Remove all the cached information about global view
     * @public
     */
    removeGlobalViewFromCache(): void;

    /**
     * @description Get hardcoded URLs view of the org
     * @returns {Promise<DataCollectionStatisticsIntf[]>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getHardcodedURLsView(): Promise<DataCollectionStatisticsIntf[]>;

    /**
     * @description Remove all the cached information about hardcoded URLs view
     * @public
     */
    removeHardcodedURLsFromCache(): void;
}