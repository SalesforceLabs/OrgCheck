import { LoggerIntf } from 'src/api/core/orgcheck-api-logger';
import { DataCacheManagerIntf } from 'src/api/core/orgcheck-api-cachemanager';
import { DataCacheManager } from 'src/api/core/orgcheck-api-cachemanager-impl';
import { DataMatrixIntf } from 'src/api/core/orgcheck-api-data-matrix';
import { DataMatrixFactory } from 'src/api/core/orgcheck-api-data-matrix-factory';
import { DatasetManager } from 'src/api/core/orgcheck-api-datasetmanager-impl';
import { DatasetManagerIntf } from 'src/api/core/orgcheck-api-datasetmanager';
import { Logger } from 'src/api/core/orgcheck-api-logger-impl';
import { OrgCheckGlobalParameter } from 'src/api/core/orgcheck-api-globalparameter';
import { RecipeAliases } from 'src/api/core/orgcheck-api-recipes-aliases';
import { RecipeManager } from 'src/api/core/orgcheck-api-recipemanager-impl';
import { RecipeManagerIntf } from 'src/api/core/orgcheck-api-recipemanager';
import { SalesforceManager } from 'src/api/core/orgcheck-api-salesforcemanager-impl';
import { SalesforceManagerIntf } from 'src/api/core/orgcheck-api-salesforcemanager';
import { SalesforceUsageInformationIntf } from 'src/api/core/orgcheck-api-limit-usageinformation';
import { SecretSauce } from 'src/api/core/orgcheck-api-secretsauce';
import { SfdcApexClass } from 'src/api/data/orgcheck-api-data-apexclass';
import { SfdcApexTrigger } from 'src/api/data/orgcheck-api-data-apextrigger';
import { SfdcBrowser } from 'src/api/data/orgcheck-api-data-browser';
import { SfdcCollaborationGroup } from 'src/api/data/orgcheck-api-data-collaborationgroup';
import { SfdcCustomLabel } from 'src/api/data/orgcheck-api-data-customlabel';
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
import { SfdcCustomTab } from 'src/api/data/orgcheck-api-data-customtab';
import { SfdcDashboard } from 'src/api/data/orgcheck-api-data-dashboard';
import { Storage } from 'src/api/core/orgcheck-api-storage-impl';
import { Compressor } from 'src/api/core/orgcheck-api-compressor-impl';
import { ApiSetup, ApiIntf } from 'src/api/orgcheck-api';
import { DataCollectionStatisticsIntf } from 'src/api/core/orgcheck-api-data-datacollectionstats';
import { DataCacheItemIntf } from 'src/api/core/orgcheck-api-cache-item';

/**
 * @description Org Check API main class
 */
export class API implements ApiIntf {

    /**
     * @description String representation of the Org Check version in a form of Element [El,n]
     * @type {string}
     * @public
     */
    public readonly version: string = 'Oxygen [O,8]';

    /**
     * @description Numerical representation of the Salesforce API Version we use
     * @type {number}
     * @public
     */
    public readonly salesforceApiVersion: number;
    
    /**
     * @description Private Recipe Manager property used to run a recipe given its alias
     * @type {RecipeManagerIntf} 
     * @private
     */
    private _recipeManager: RecipeManagerIntf;

    /**
     * @description Private Dataset Manager property used to run a dataset given its alias
     * @type {DatasetManagerIntf}
     * @private
     */
    private _datasetManager: DatasetManagerIntf;

    /**
     * @description Private Salesforce Manager property used to call the salesforce APIs using JsForce framework
     * @type {SalesforceManagerIntf}
     * @private
     */
    private _sfdcManager: SalesforceManagerIntf;

    /**
     * @description Private data cache manager to store data from datasetManager
     * @type {DataCacheManagerIntf}
     * @private
     */
    private _cacheManager: DataCacheManagerIntf;

    /**
     * @description Private Logger property used to send log information to the UI (if any)
     * @type {LoggerIntf}
     * @private
     */
    private _logger: LoggerIntf;

    /**
     * @description Is the current user accepted the terms manually to use Org Check in this org?
     * @type {boolean}
     * @private
     */
    private _usageTermsAcceptedManually: boolean;

    /**
     * @description Org Check constructor
     * @param {ApiSetup} setup - the setup object to configure the Org Check API
     */    
    constructor(setup: ApiSetup) {
        
        // --------------------
        // Logger
        // --------------------
        if (!setup?.logSettings) { 
            throw new Error(`Setup is missing a logSettings property`); 
        }
        this._logger = new Logger(setup?.logSettings);

        // --------------------
        // Salesforce Manager
        // --------------------
        if (!setup?.salesforce) { 
            throw new Error(`Setup is missing a salesforce property`); 
        }
        this._sfdcManager = new SalesforceManager(setup?.salesforce);
        this.salesforceApiVersion = this._sfdcManager.apiVersion;

        // --------------------
        // Cache Manager
        // --------------------
        if (!setup?.storage) { 
            throw new Error(`Setup is missing a storage property`); 
        }
        this._cacheManager = new DataCacheManager(new Compressor(), new Storage(setup?.storage));

        // --------------------
        // Other
        // --------------------
        this._datasetManager = new DatasetManager(this._sfdcManager, this._cacheManager, this._logger);
        this._recipeManager = new RecipeManager(this._datasetManager, this._logger);
        this._usageTermsAcceptedManually = false;
    }
    
    /**
     * @description Remove all cache from dataset manager
     * @public
     */
    public removeAllFromCache() {
        this._cacheManager.clear();
    }

    /**
     * @description Get cache information from dataset manager
     * @returns {Array<DataCacheItemIntf>} list of cache information 
     * @public
     */
    public getCacheInformation(): Array<DataCacheItemIntf> {
        return this._cacheManager.details();
    }

    /**
     * @description Get cache data from dataset manager
     * @param {string} itemName - the name of the cache item to get
     * @returns {any} cached data 
     * @public
     */
    public getCacheData(itemName: string): any {
        return this._cacheManager.get(itemName);
    }

    /**
     * @description Get the list of all Org Check "score rules" as a matrix
     * @returns {DataMatrixIntf} Information about score rules as a matrix
     * @public
     */
    public getAllScoreRulesAsDataMatrix(): DataMatrixIntf {
        const workingMatrix = DataMatrixFactory.create();
        SecretSauce.AllScoreRules.forEach((rule) => {
            workingMatrix.setRowHeader(`${rule.id}`, rule);
            rule.applicable.forEach((dataAlias) => {
                workingMatrix.addValueToProperty(
                    `${rule.id}`,
                    dataAlias?.toString() ?? 'N/A', 
                    'true'
                );
            });
        });
        return workingMatrix.toDataMatrix();
    }

    /**
     * @description Get the lastest Daily API Usage from JSForce, and the level of confidence we have in this ratio to continue using org check.
     * @returns {SalesforceUsageInformationIntf} Percentage of the daily api usage and a confidence precentage.
     * @public
     */
    public get dailyApiRequestLimitInformation(): SalesforceUsageInformationIntf {
        return this._sfdcManager.dailyApiRequestLimitInformation;
    }

    /**
     * @description Send a request to run all tests in the org. When this method is finished, it does not mean all tests are run.
     * @returns {Promise<string>} The Salesforce Id of the AsyncApexJob
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    async runAllTestsAsync(): Promise<string> {
        if (this._logger === undefined) {
            throw new Error(`The logger was not defined in method runAllTestsAsync`);
        }
        const simpleLogger = this._logger?.toSimpleLogger('Run All Tests');
        if (simpleLogger === undefined) {
            throw new Error(`The simple logger was not defined in method runAllTestsAsync`);
        }
        return this._sfdcManager?.runAllTests(simpleLogger);
    }

    /**
     * @description Compile the given list of Apex Classes and return the status of the compilation
     * @param {Array<string>} apexClassIds - the list of Apex Class Ids to compile
     * @returns {Promise<Map<string, { isSuccess: boolean, reasons?: Array<string>}>>} List of results by Apex Class ID
     * @async
     * @public
     */
    public async compileClasses(apexClassIds: Array<string>): Promise<Map<string, { isSuccess: boolean; reasons?: Array<string>; }>> {
        if (this._logger === undefined) {
            throw new Error(`The logger was not defined in method compileClasses`);
        }
        const simpleLogger = this._logger?.toSimpleLogger('Compile Classes');
        if (simpleLogger === undefined) {
            throw new Error(`The simple logger was not defined in method compileClasses`);
        }
        return this._sfdcManager?.compileClasses(apexClassIds, simpleLogger);
    }

    /**
     * @description Get information about the organization
     * @returns {Promise<SfdcOrganization>} Org information to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async getOrganizationInformation(): Promise<SfdcOrganization> {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.ORGANIZATION));
    }

    /**
     * @description Check if we can use the current org according to the terms (specially if this is a production org)
     * @returns {Promise<boolean>} true if this org can be used, false otehrwise.
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async checkUsageTerms(): Promise<boolean> {
        const orgInfo = (await this.getOrganizationInformation());
        if (orgInfo.isProduction === true && this._usageTermsAcceptedManually === false) {
            return false;
        }
        return true;
    }

    /**
     * @description Returns if the usage terms were accepted manually
     * @returns {boolean} true if the usage terms were accepted manually, false otherwise
     * @public
     */
    public wereUsageTermsAcceptedManually(): boolean {
        return this._usageTermsAcceptedManually;
    }

    /**
     * @description Accept manually the usage terms
     * @public
     */
    public acceptUsageTermsManually() {
        this._usageTermsAcceptedManually = true;
    }

    /**
     * @description Check if the current user can run the application
     * @returns {Promise<boolean>} true if this user can run the application. Never returns false (see exception)
     * @throws Exception if not enough permissions to run the application
     * @async
     * @public
     */
    public async checkCurrentUserPermissions(): Promise<boolean> {
        // @ts-ignore
        const /** @type {Map} */ perms: Map = (await this._recipeManager.run(RecipeAliases.CURRENT_USER_PERMISSIONS, new Map([
            [OrgCheckGlobalParameter.SYSTEM_PERMISSIONS_LIST, [ 'ModifyAllData', 'AuthorApex', 'ApiEnabled', 'InstallPackaging' ]]
        ])));
        if (perms === undefined || 
            perms?.get('ModifyAllData') === false || perms?.get('AuthorApex')       === false ||
            perms?.get('ApiEnabled')    === false || perms?.get('InstallPackaging') === false) {
                throw (new TypeError(
                    'Current User Permission Access is not enough to run the application. '+
                    'Please make sure to assign ALL the following permissions to the current user: '+
                    `Modify All Data, Author Apex, API Enabled and Download AppExchange Packages.`
                ));
        }
        return true;
    }

    /**
     * @description Get information about the packages
     * @returns {Promise<Array<SfdcPackage>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async getPackages(): Promise<Array<SfdcPackage>> {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.PACKAGES));
    }

    /**
     * @description Remove all the cached information about packages
     * @public
     */
    public removeAllPackagesFromCache() {
        this._recipeManager.clean(RecipeAliases.PACKAGES);
    }

    /**
     * @description Get information about the page layouts
     * @param {string} namespace - the namespace of the package to filter the page layouts
     * @param {string} sobjectType - the sobject type to filter the page layouts
     * @param {string} sobject - the sobject to filter the page layouts
     * @returns {Promise<Array<SfdcPageLayout>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async getPageLayouts(namespace: string, sobjectType: string, sobject: string): Promise<Array<SfdcPageLayout>> {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.PAGE_LAYOUTS, new Map([
            [OrgCheckGlobalParameter.SOBJECT_NAME, sobject],
            [OrgCheckGlobalParameter.PACKAGE_NAME, namespace],
            [OrgCheckGlobalParameter.SOBJECT_TYPE_NAME, sobjectType]
        ])));
    }

    /**
     * @description Remove all the cached information about page layouts
     * @public
     */
    public removeAllPageLayoutsFromCache() {
        this._recipeManager.clean(RecipeAliases.PAGE_LAYOUTS);
    }

    /**
     * @description Get information about the object types
     * @returns {Promise<Array<SfdcObjectType>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async getObjectTypes(): Promise<Array<SfdcObjectType>> {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.OBJECT_TYPES));
    }

    /**
     * @description Get information about the objects 
     * @param {string} namespace - the namespace of the package to filter the objects
     * @param {string} sobjectType - the sobject type to filter the objects
     * @returns {Promise<Array<SfdcObject>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async getObjects(namespace: string, sobjectType: string): Promise<Array<SfdcObject>> {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.OBJECTS, new Map([
            [OrgCheckGlobalParameter.PACKAGE_NAME, namespace],
            [OrgCheckGlobalParameter.SOBJECT_TYPE_NAME, sobjectType],
        ])));
    }

    /**
     * @description Remove all the cached information about objects
     * @public
     */
    public removeAllObjectsFromCache() {
        this._recipeManager.clean(RecipeAliases.OBJECTS);
    }

    /**
     * @description Get information about a specific sobject
     * @param {string} sobject - the name of the sobject to get information about
     * @returns {Promise<SfdcObject>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async getObject(sobject: string): Promise<SfdcObject> {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.OBJECT, new Map([
            [OrgCheckGlobalParameter.SOBJECT_NAME, sobject]
        ])));
    }

    /**
     * @description Remove all the cached information about a specific sobject
     * @param {string} sobject - the name of the sobject to remove from cache
     * @public
     */
    public removeObjectFromCache(sobject: string) {
        this._recipeManager.clean(RecipeAliases.OBJECT, new Map([[OrgCheckGlobalParameter.SOBJECT_NAME, sobject]]));
    }

    /**
     * @description Get information about object permissions per parent (kind of matrix view)
     * @param {string} namespace - the namespace of the package to filter the object permissions
     * @returns {Promise<DataMatrixIntf>} Information about objects (list of string) and permissions (list of SfdcObjectPermissionsPerParent)
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async getObjectPermissionsPerParent(namespace: string): Promise<DataMatrixIntf> {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.OBJECT_PERMISSIONS, new Map([
            [ OrgCheckGlobalParameter.PACKAGE_NAME, namespace ]
        ])));
    }

    /**
     * @description Remove all the cached information about object permissions
     * @public
     */
    public removeAllObjectPermissionsFromCache() {
        this._recipeManager.clean(RecipeAliases.OBJECT_PERMISSIONS);
    }

    /**
     * @description Get information about application permissions per parent (kind of matrix view)
     * @param {string} namespace - the namespace of the package to filter the application permissions
     * @returns {Promise<DataMatrixIntf>} Information about applications (list of string) and permissions (list of SfdcAppPermissionsPerParent)
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async getApplicationPermissionsPerParent(namespace: string): Promise<DataMatrixIntf> {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.APP_PERMISSIONS, new Map([
            [ OrgCheckGlobalParameter.PACKAGE_NAME, namespace ]
        ])));
    }

    /**
     * @description Remove all the cached information about application permissions
     * @public
     */
    public removeAllAppPermissionsFromCache() {
        this._recipeManager.clean(RecipeAliases.APP_PERMISSIONS);
    }

    /**
     * @description Get information about knowledge articles
     * @returns {Promise<Array<SfdcKnowledgeArticle>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async getKnowledgeArticles(): Promise<Array<SfdcKnowledgeArticle>> {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.KNOWLEDGE_ARTICLES));
    }

    /**
     * @description Remove all the cached information about knowledge articles
     * @public
     */
    public removeAllKnowledgeArticlesFromCache() {
        this._recipeManager.clean(RecipeAliases.KNOWLEDGE_ARTICLES);
    }    

    /**
     * @description Get information about Chatter groups
     * @returns {Promise<Array<SfdcCollaborationGroup>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async getChatterGroups(): Promise<Array<SfdcCollaborationGroup>> {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.COLLABORATION_GROUPS));
    }

    /**
     * @description Remove all the cached information about Chatter groups
     * @public
     */
    public removeAllChatterGroupsFromCache() {
        this._recipeManager.clean(RecipeAliases.COLLABORATION_GROUPS);
    }    

    /**
     * @description Get information about custom fields (filtered out by namespace/pakage, type and sobject)
     * @param {string} namespace - the namespace of the package to filter the custom fields
     * @param {string} sobjectType - the sobject type to filter the custom fields
     * @param {string} sobject - the sobject to filter the custom fields
     * @returns {Promise<Array<SfdcField>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async getCustomFields(namespace: string, sobjectType: string, sobject: string): Promise<Array<SfdcField>> {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.CUSTOM_FIELDS, new Map([
            [OrgCheckGlobalParameter.PACKAGE_NAME, namespace], 
            [OrgCheckGlobalParameter.SOBJECT_TYPE_NAME, sobjectType],
            [OrgCheckGlobalParameter.SOBJECT_NAME, sobject]
        ])));
    }

    /**
     * @description Remove all the cached information about custom fields
     * @public
     */
    public removeAllCustomFieldsFromCache() {
        this._recipeManager.clean(RecipeAliases.CUSTOM_FIELDS);
    }

    /**
     * @description Get information about permission sets (filtered out by namespace/pakage)
     * @param {string} namespace - the namespace of the package to filter the permission sets
     * @returns {Promise<Array<SfdcPermissionSet>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async getPermissionSets(namespace: string): Promise<Array<SfdcPermissionSet>> {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.PERMISSION_SETS, new Map([
            [ OrgCheckGlobalParameter.PACKAGE_NAME, namespace ]
        ])));
    }
    
    /**
     * @description Remove all the cached information about permission sets
     * @public
     */
    public removeAllPermSetsFromCache() {
        this._recipeManager.clean(RecipeAliases.PERMISSION_SETS);
    }

    /**
     * @description Get information about permission set licenses
     * @returns {Promise<Array<SfdcPermissionSetLicense>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async getPermissionSetLicenses(): Promise<Array<SfdcPermissionSetLicense>> {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.PERMISSION_SET_LICENSES));
    }
    
    /**
     * @description Remove all the cached information about permission set licenses
     * @public
     */
    public removeAllPermSetLicensesFromCache() {
        this._recipeManager.clean(RecipeAliases.PERMISSION_SET_LICENSES);
    }

    /**
     * @description Get information about profiles (filtered out by namespace/pakage)
     * @param {string} [namespace] - the namespace of the package to filter the profiles
     * @returns {Promise<Array<SfdcProfile>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async getProfiles(namespace?: string): Promise<Array<SfdcProfile>> {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.PROFILES, new Map([
            [ OrgCheckGlobalParameter.PACKAGE_NAME, namespace ]
        ])));
    }

    /**
     * @description Remove all the cached information about profiles
     * @public
     */
    public removeAllProfilesFromCache() {
        this._recipeManager.clean(RecipeAliases.PROFILES);
    }

    /**
     * @description Get information about profile restrictions (filtered out by namespace/pakage)
     * @param {string} namespace - the namespace of the package to filter the profile restrictions
     * @returns {Promise<Array<SfdcProfileRestrictions>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async getProfileRestrictions(namespace: string): Promise<Array<SfdcProfileRestrictions>> {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.PROFILE_RESTRICTIONS, new Map([
            [ OrgCheckGlobalParameter.PACKAGE_NAME, namespace ]
        ])));
    }

    /**
     * @description Remove all the cached information about profile restrictions
     * @public
     */
    public removeAllProfileRestrictionsFromCache() {
        this._recipeManager.clean(RecipeAliases.PROFILE_RESTRICTIONS);
    }

    /**
     * @description Get information about profile password policies
     * @returns {Promise<Array<SfdcProfilePasswordPolicy>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async getProfilePasswordPolicies(): Promise<Array<SfdcProfilePasswordPolicy>> {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.PROFILE_PWD_POLICIES));
    }

    /**
     * @description Remove all the cached information about profile password policies
     * @public
     */
    public removeAllProfilePasswordPoliciesFromCache() {
        this._recipeManager.clean(RecipeAliases.PROFILE_PWD_POLICIES);
    }

    /**
     * @description Get information about active users
     * @returns {Promise<Array<SfdcUser>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async getActiveUsers(): Promise<Array<SfdcUser>> {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.INTERNAL_ACTIVE_USERS));
    }

    /**
     * @description Remove all the cached information about active users
     * @public
     */
    public removeAllActiveUsersFromCache() {
        this._recipeManager.clean(RecipeAliases.INTERNAL_ACTIVE_USERS);
    }

    /**
     * @description Get information about browsers
     * @returns {Promise<Array<SfdcBrowser>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async getBrowsers(): Promise<Array<SfdcBrowser>> {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.BROWSERS));
    }

    /**
     * @description Remove all the cached information about browsers
     * @public
     */
    public removeAllBrowsersFromCache() {
        this._recipeManager.clean(RecipeAliases.BROWSERS);
    }

    /**
     * @description Get information about custom labels (filtered out by namespace/pakage)
     * @param {string} namespace - the namespace of the package to filter the custom labels
     * @returns {Promise<Array<SfdcCustomLabel>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async getCustomLabels(namespace: string): Promise<Array<SfdcCustomLabel>> {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.CUSTOM_LABELS, new Map([
            [ OrgCheckGlobalParameter.PACKAGE_NAME, namespace ]
        ])));
    }

    /**
     * @description Remove all the cached information about custom labels
     * @public
     */
    public removeAllCustomLabelsFromCache() {
        this._recipeManager.clean(RecipeAliases.CUSTOM_LABELS);
    }

    /**
     * @description Get information about custom tabs (filtered out by namespace/pakage)
     * @param {string} namespace - the namespace of the package to filter the custom tabs
     * @returns {Promise<Array<SfdcCustomTab>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async getCustomTabs(namespace: string): Promise<Array<SfdcCustomTab>> {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.CUSTOM_TABS, new Map([
            [ OrgCheckGlobalParameter.PACKAGE_NAME, namespace ]
        ])));
    }

    /**
     * @description Remove all the cached information about custom tabs
     * @public
     */
    public removeAllCustomTabsFromCache() {
        this._recipeManager.clean(RecipeAliases.CUSTOM_TABS);
    }

    /**
     * @description Get information about documents (filtered out by namespace/pakage)
     * @param {string} namespace - the namespace of the package to filter the documents
     * @returns {Promise<Array<SfdcDocument>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async getDocuments(namespace: string): Promise<Array<SfdcDocument>> {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.DOCUMENTS, new Map([
            [ OrgCheckGlobalParameter.PACKAGE_NAME, namespace ]
        ])));
    }

    /**
     * @description Remove all the cached information about documents
     * @public
     */
    public removeAllDocumentsFromCache() {
        this._recipeManager.clean(RecipeAliases.DOCUMENTS);
    }

    /**
     * @description Get information about LWCs (filtered out by namespace/pakage)
     * @param {string} namespace - the namespace of the package to filter the lightning web components
     * @returns {Promise<Array<SfdcLightningWebComponent>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async getLightningWebComponents(namespace: string): Promise<Array<SfdcLightningWebComponent>> {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.LIGHTNING_WEB_COMPONENTS, new Map([
            [ OrgCheckGlobalParameter.PACKAGE_NAME, namespace ]
        ])));
    }
    
    /**
     * @description Remove all the cached information about lightning web components
     * @public
     */
    public removeAllLightningWebComponentsFromCache() {
        this._recipeManager.clean(RecipeAliases.LIGHTNING_WEB_COMPONENTS);
    }

    /**
     * @description Get information about Aura Components (filtered out by namespace/pakage)
     * @param {string} namespace - the namespace of the package to filter the lightning aura components
     * @returns {Promise<Array<SfdcLightningAuraComponent>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async getLightningAuraComponents(namespace: string): Promise<Array<SfdcLightningAuraComponent>> {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.LIGHTNING_AURA_COMPONENTS, new Map([
            [ OrgCheckGlobalParameter.PACKAGE_NAME, namespace ]
        ])));
    }

    /**
     * @description Remove all the cached information about lightning aura components
     * @public
     */
    public removeAllLightningAuraComponentsFromCache() {
        this._recipeManager.clean(RecipeAliases.LIGHTNING_AURA_COMPONENTS);
    }

    /**
     * @description Get information about flexipages (filtered out by namespace/pakage)
     * @param {string} namespace - the namespace of the package to filter the lightning pages
     * @returns {Promise<Array<SfdcLightningPage>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async getLightningPages(namespace: string): Promise<Array<SfdcLightningPage>> {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.LIGHTNING_PAGES, new Map([
            [ OrgCheckGlobalParameter.PACKAGE_NAME, namespace ]
        ])));
    }

    /**
     * @description Remove all the cached information about lightning pages
     * @public
     */
    public removeAllLightningPagesFromCache() {
        this._recipeManager.clean(RecipeAliases.LIGHTNING_PAGES);
    }
    
    /**
     * @description Get information about VFCs (filtered out by namespace/pakage)
     * @param {string} namespace - the namespace of the package to filter the visualforce components
     * @returns {Promise<Array<SfdcVisualForceComponent>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async getVisualForceComponents(namespace: string): Promise<Array<SfdcVisualForceComponent>> {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.VISUALFORCE_COMPONENTS, new Map([
            [ OrgCheckGlobalParameter.PACKAGE_NAME, namespace ]
        ])));
    }
    
    /**
     * @description Remove all the cached information about Visualforce Components
     * @public
     */
    public removeAllVisualForceComponentsFromCache() {
        this._recipeManager.clean(RecipeAliases.VISUALFORCE_COMPONENTS);
    }

    /**
     * @description Get information about VFPs (filtered out by namespace/pakage)
     * @param {string} namespace - the namespace of the package to filter the visualforce pages
     * @returns {Promise<Array<SfdcVisualForcePage>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async getVisualForcePages(namespace: string): Promise<Array<SfdcVisualForcePage>> {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.VISUALFORCE_PAGES, new Map([
            [ OrgCheckGlobalParameter.PACKAGE_NAME, namespace ]
        ])));
    }

    /**
     * @description Remove all the cached information about Visualforce Pages
     * @public
     */
    public removeAllVisualForcePagesFromCache() {
        this._recipeManager.clean(RecipeAliases.VISUALFORCE_PAGES);
    }
    
    /**
     * @description Get information about Public Groups
     * @returns {Promise<Array<SfdcGroup>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async getPublicGroups(): Promise<Array<SfdcGroup>> {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.PUBLIC_GROUPS));
    }

    /**
     * @description Remove all the cached information about public groups
     * @public
     */
    public removeAllPublicGroupsFromCache() {
        this._recipeManager.clean(RecipeAliases.PUBLIC_GROUPS);
    }

    /**
     * @description Get information about Queues
     * @returns {Promise<Array<SfdcGroup>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async getQueues(): Promise<Array<SfdcGroup>> {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.QUEUES));
    }

    /**
     * @description Remove all the cached information about queues
     * @public
     */
    public removeAllQueuesFromCache() {
        this._recipeManager.clean(RecipeAliases.QUEUES);
    }

    /**
     * @description Get information about Apex Classes (filtered out by namespace/pakage)
     * @param {string} namespace - the namespace of the package to filter the apex classes
     * @returns {Promise<Array<SfdcApexClass>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async getApexClasses(namespace: string): Promise<Array<SfdcApexClass>> {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.APEX_CLASSES, new Map([
            [ OrgCheckGlobalParameter.PACKAGE_NAME, namespace ]
        ])));
    }

    /**
     * @description Remove all the cached information about apex classes
     * @public
     */
    public removeAllApexClassesFromCache() {
        this._recipeManager.clean(RecipeAliases.APEX_CLASSES);
    }

    /**
     * @description Get information about Apex Tests (filtered out by namespace/pakage)
     * @param {string} namespace - the namespace of the package to filter the apex tests
     * @returns {Promise<Array<SfdcApexClass>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async getApexTests(namespace: string): Promise<Array<SfdcApexClass>> {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.APEX_TESTS, new Map([
            [ OrgCheckGlobalParameter.PACKAGE_NAME, namespace ]
        ])));
    }

    /**
     * @description Remove all the cached information about apex tests
     * @public
     */
    public removeAllApexTestsFromCache() {
        this._recipeManager.clean(RecipeAliases.APEX_TESTS);
    }

    /**
     * @description Get information about Apex Uncompiled Classes (filtered out by namespace/pakage)
     * @param {string} namespace - the namespace of the package to filter the apex uncompiled classes
     * @returns {Promise<Array<SfdcApexClass>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async getApexUncompiled(namespace: string): Promise<Array<SfdcApexClass>> {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.APEX_UNCOMPILED, new Map([
            [ OrgCheckGlobalParameter.PACKAGE_NAME, namespace ]
        ])));
    }

    /**
     * @description Remove all the cached information about apex uncompiled classes
     * @public
     */
    public removeAllApexUncompiledFromCache() {
        this._recipeManager.clean(RecipeAliases.APEX_UNCOMPILED);
    }

    /**
     * @description Get information about Apex triggers (filtered out by namespace/pakage)
     * @param {string} namespace - the namespace of the package to filter the apex triggers
     * @returns {Promise<Array<SfdcApexTrigger>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async getApexTriggers(namespace: string): Promise<Array<SfdcApexTrigger>> {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.APEX_TRIGGERS, new Map([
            [ OrgCheckGlobalParameter.PACKAGE_NAME, namespace ]
        ])));
    }

    /**
     * @description Remove all the cached information about apex triggers
     * @public
     */
    public removeAllApexTriggersFromCache() {
        this._recipeManager.clean(RecipeAliases.APEX_TRIGGERS);
    }

    /**
     * @description Get information about User roles in a tabular view
     * @returns {Promise<Array<SfdcUserRole>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async getRoles(): Promise<Array<SfdcUserRole>> {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.USER_ROLES));
    }

    /**
     * @description Remove all the cached information about roles
     * @public
     */
    public removeAllRolesFromCache() {
        this._recipeManager.clean(RecipeAliases.USER_ROLES);
    }

    /**
     * @description Get information about User Roles in a tree view
     * @returns {Promise<SfdcUserRole>} Tree
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async getRolesTree(): Promise<SfdcUserRole> {
        // Get data
        const allRoles = (await this.getRoles());
        // @ts-ignore
        // Create a map that stores all nodes
        // Where:
        //   - key is the id of the node (string)
        //   - value is the node with properties: 
        //        * 'id' (mandatory string), 
        //        * 'children' (optional array), and,
        //        * 'record' (undefined for root, mandatory for other than root -- of type: SfdcUserRole)
        const allNodes = new Map();
        // Key for artificial ROOT
        const ROOT_KEY = '__i am root__';
        // Note that 'allRoles' is an 'Array'
        allRoles?.forEach((role) => { 
            // is this node already registered? if false create (with no children!) and set in the map
            if (allNodes.has(role.id) === false) { allNodes.set(role.id, { id: role.id }) }
            // get a reference to this node
            const node = allNodes.get(role.id);
            // if that node just got registered, it has no 'record' yet
            // if that node was previously a parent (and got registered at that time), it has no 'record' yet
            if (!node.record) node.record = role; // for this reasons, we set the record property if not set
            // get the id of its parent (if no parent using the artificial 'root' node)
            const parentId = role.hasParent === true ? role.parentId : ROOT_KEY;
            // is the parent already registered? if false create (with no record!) and set in the map
            if (allNodes.has(parentId) === false) { allNodes.set(parentId, { id: parentId }) }
            // get a reference to this parent node
            const parentNode = allNodes.get(parentId);
            // if that parent just got registered, it has no 'children' yet
            // if that parent was previously a child (and got registered at that time), it has no 'children' yet
            if (!parentNode.children) parentNode.children = []; // for this reasons, we set the children property if not set
            parentNode.children.push(node);
        });
        return allNodes.get(ROOT_KEY);
    }

    /**
     * @description Get information about Static Resources
     * @param {string} namespace - the namespace of the package to filter the weblinks
     * @returns {Promise<Array<SfdcStaticResource>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async getStaticResources(namespace: string): Promise<Array<SfdcStaticResource>> {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.STATIC_RESOURCES, new Map([
            [OrgCheckGlobalParameter.PACKAGE_NAME, namespace]
        ])));
    }

    /**
     * @description Remove all the cached information about Static Resources
     * @public
     */
    public removeAllStaticResourcesFromCache() {
        this._recipeManager.clean(RecipeAliases.STATIC_RESOURCES);
    }

    /**
     * @description Get information about WebLinks
     * @param {string} [namespace] - the namespace of the package to filter the weblinks
     * @param {string} [sobjectType] - the sobject type to filter the weblinks
     * @param {string} [sobject] - the sobject to filter the weblinks
     * @returns {Promise<Array<SfdcWebLink>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async getWeblinks(namespace?: string, sobjectType?: string, sobject?: string): Promise<Array<SfdcWebLink>> {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.WEBLINKS, new Map([
            [OrgCheckGlobalParameter.SOBJECT_NAME, sobject],
            [OrgCheckGlobalParameter.PACKAGE_NAME, namespace],
            [OrgCheckGlobalParameter.SOBJECT_TYPE_NAME, sobjectType]
        ])));
    }

    /**
     * @description Remove all the cached information about WebLinks
     * @public
     */
    public removeAllWeblinksFromCache() {
        this._recipeManager.clean(RecipeAliases.WEBLINKS);
    }    

    /**
     * @description Get information about Workflows
     * @returns {Promise<Array<SfdcWorkflow>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async getWorkflows(): Promise<Array<SfdcWorkflow>> {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.WORKFLOWS));
    }

    /**
     * @description Remove all the cached information about workflows
     * @public
     */
    public removeAllWorkflowsFromCache() {
        this._recipeManager.clean(RecipeAliases.WORKFLOWS);
    }

    /**
     * @description Get information about record types
     * @param {string} namespace - the namespace of the package to filter the record types
     * @param {string} sobjectType - the sobject type to filter the record types
     * @param {string} sobject - the sobject to filter the record types
     * @returns {Promise<Array<SfdcRecordType>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async getRecordTypes(namespace: string, sobjectType: string, sobject: string): Promise<Array<SfdcRecordType>> {
        // @ts-ignore    
        return (await this._recipeManager.run(RecipeAliases.RECORD_TYPES, new Map([
            [OrgCheckGlobalParameter.SOBJECT_NAME, sobject],
            [OrgCheckGlobalParameter.PACKAGE_NAME, namespace],
            [OrgCheckGlobalParameter.SOBJECT_TYPE_NAME, sobjectType]
        ])));
    }

    /**
     * @description Remove all the cached information about record types
     * @public
     */
    public removeAllRecordTypesFromCache() {
        this._recipeManager.clean(RecipeAliases.RECORD_TYPES);
    }

    /**
     * @description Get information about field permissions per parent (kind of matrix view) for a specific sobject
     * @param {string} sobject - the name of the sobject to get information about
     * @param {string} namespace - the namespace of the package to filter the field permissions
     * @returns {Promise<DataMatrixIntf>} Information about fields (list of string) and permissions (list of SfdcFieldPermissionsPerParent)
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async getFieldPermissionsPerParent(sobject: string, namespace: string): Promise<DataMatrixIntf> {
        // @ts-ignore    
        return (await this._recipeManager.run(RecipeAliases.FIELD_PERMISSIONS, new Map([
            [OrgCheckGlobalParameter.SOBJECT_NAME, sobject],
            [OrgCheckGlobalParameter.PACKAGE_NAME, namespace]
        ])));
    }

    /**
     * @description Remove all the cached information about field permissions
     * @public
     */
    public removeAllFieldPermissionsFromCache() {
        this._recipeManager.clean(RecipeAliases.FIELD_PERMISSIONS);
    }

    /**
     * @description Get information about Flows
     * @returns {Promise<Array<SfdcFlow>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async getFlows(): Promise<Array<SfdcFlow>> {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.FLOWS));
    }

    /**
     * @description Remove all the cached information about flows
     * @public
     */
    public removeAllFlowsFromCache() {
        this._recipeManager.clean(RecipeAliases.FLOWS);
    }
    
    /**
     * @description Get information about EmailTemplate
     * @param {string} namespace - the namespace of the package to filter the email templates
     * @returns {Promise<Array<SfdcEmailTemplate>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async getEmailTemplates(namespace: string): Promise<Array<SfdcEmailTemplate>> {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.EMAIL_TEMPLATES, new Map([
            [OrgCheckGlobalParameter.PACKAGE_NAME, namespace]
        ])));
    }

    /**
     * @description Remove all the cached information about email template
     * @public
     */
    public removeAllEmailTemplatesFromCache() {
        this._recipeManager.clean(RecipeAliases.EMAIL_TEMPLATES);
    }

    /**
     * @description Get information about home page components
     * @returns {Promise<Array<SfdcHomePageComponent>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async getHomePageComponents(): Promise<Array<SfdcHomePageComponent>> {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.HOME_PAGE_COMPONENTS));
    }

    /**
     * @description Remove all the cached information about home page components
     * @public
     */
    public removeAllHomePageComponentsFromCache() {
        this._recipeManager.clean(RecipeAliases.HOME_PAGE_COMPONENTS);
    }

    /**
     * @description Get information about Process Builders
     * @returns {Promise<Array<SfdcFlow>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async getProcessBuilders(): Promise<Array<SfdcFlow>> {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.PROCESS_BUILDERS));
    }

    /**
     * @description Remove all the cached information about process builders
     * @public
     */
    public removeAllProcessBuildersFromCache() {
        this._recipeManager.clean(RecipeAliases.PROCESS_BUILDERS);
    }
    
    /**
     * @description Get information about Validation rules
     * @param {string} namespace - the namespace of the package to filter the validation rules
     * @param {string} sobjectType - the sobject type to filter the validation rules
     * @param {string} sobject - the sobject to filter the validation rules
     * @returns {Promise<Array<SfdcValidationRule>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async getValidationRules(namespace: string, sobjectType: string, sobject: string): Promise<Array<SfdcValidationRule>> {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.VALIDATION_RULES, new Map([
            [OrgCheckGlobalParameter.SOBJECT_NAME, sobject],
            [OrgCheckGlobalParameter.PACKAGE_NAME, namespace],
            [OrgCheckGlobalParameter.SOBJECT_TYPE_NAME, sobjectType]
        ])));
    }
    
    /**
     * @description Remove all the cached information about validation rules
     * @public
     */
    public removeAllValidationRulesFromCache() {
        this._recipeManager.clean(RecipeAliases.VALIDATION_RULES);
    }

    /**
     * @description Get information about dashboards
     * @returns {Promise<Array<SfdcDashboard>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async getDashboards(): Promise<Array<SfdcDashboard>> {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.DASHBOARDS));
    }
    
    /**
     * @description Remove all the cached information about dashboards
     * @public
     */
    public removeAllDashboardsFromCache() {
        this._recipeManager.clean(RecipeAliases.DASHBOARDS);
    }

    /**
     * @description Get information about reports
     * @returns {Promise<Array<SfdcReport>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async getReports(): Promise<Array<SfdcReport>> {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.REPORTS));
    }
    
    /**
     * @description Remove all the cached information about reports
     * @public
     */
    public removeAllReportsFromCache() {
        this._recipeManager.clean(RecipeAliases.REPORTS);
    }

    /**
     * @description Get global view of the org
     * @returns {Promise<Array<DataCollectionStatisticsIntf>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async getGlobalView(): Promise<Array<DataCollectionStatisticsIntf>> {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.GLOBAL_VIEW));
    }

    /**
     * @description Remove all the cached information about global view
     * @public
     */
    public removeGlobalViewFromCache() {
        this._recipeManager.clean(RecipeAliases.GLOBAL_VIEW);
    }

    /**
     * @description Get hardcoded URLs view of the org
     * @returns {Promise<Array<DataCollectionStatisticsIntf>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async getHardcodedURLsView(): Promise<Array<DataCollectionStatisticsIntf>> {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.HARDCODED_URLS_VIEW));
    }

    /**
     * @description Remove all the cached information about hardcoded URLs view
     * @public
     */
    public removeHardcodedURLsFromCache() {
        this._recipeManager.clean(RecipeAliases.HARDCODED_URLS_VIEW);
    }
}