import { BasicLoggerIntf, LoggerIntf } from './core/orgcheck-api-logger';
import { DataCacheItem, DataCacheManagerIntf } from './core/orgcheck-api-cachemanager';
import { DataCacheManager } from './core/orgcheck-api-cachemanager-impl';
import { DataMatrix } from './core/orgcheck-api-data-matrix';
import { DataMatrixFactory } from './core/orgcheck-api-data-matrix-factory';
import { DatasetManager } from './core/orgcheck-api-datasetmanager-impl';
import { DatasetManagerIntf } from './core/orgcheck-api-datasetmanager';
import { Logger } from './core/orgcheck-api-logger-impl';
import { RecipeAliases } from './core/orgcheck-api-recipes-aliases';
import { RecipeManager } from './core/orgcheck-api-recipemanager-impl';
import { RecipeManagerIntf } from './core/orgcheck-api-recipemanager';
import { SalesforceManager } from './core/orgcheck-api-salesforcemanager-impl';
import { SalesforceManagerIntf } from './core/orgcheck-api-salesforcemanager';
import { SalesforceUsageInformation } from './core/orgcheck-api-salesforce-watchdog';
import { ScoreRule } from './core/orgcheck-api-datafactory';
import { SecretSauce } from './core/orgcheck-api-secretsauce';
import { SFDC_ApexClass } from './data/orgcheck-api-data-apexclass';
import { SFDC_ApexTrigger } from './data/orgcheck-api-data-apextrigger';
import { SFDC_CustomLabel } from './data/orgcheck-api-data-customlabel';
import { SFDC_Document } from './data/orgcheck-api-data-document';
import { SFDC_Field } from './data/orgcheck-api-data-field';
import { SFDC_Flow } from './data/orgcheck-api-data-flow';
import { SFDC_Group } from './data/orgcheck-api-data-group';
import { SFDC_LightningAuraComponent } from './data/orgcheck-api-data-lightningauracomponent';
import { SFDC_LightningPage } from './data/orgcheck-api-data-lightningpage';
import { SFDC_LightningWebComponent } from './data/orgcheck-api-data-lightningwebcomponent';
import { SFDC_Object } from './data/orgcheck-api-data-object';
import { SFDC_ObjectType } from './data/orgcheck-api-data-objecttype';
import { SFDC_Organization } from './data/orgcheck-api-data-organization';
import { SFDC_Package } from './data/orgcheck-api-data-package';
import { SFDC_PageLayout } from './data/orgcheck-api-data-pagelayout';
import { SFDC_PermissionSet } from './data/orgcheck-api-data-permissionset';
import { SFDC_PermissionSetLicense } from './data/orgcheck-api-data-permissionsetlicense';
import { SFDC_Profile } from './data/orgcheck-api-data-profile';
import { SFDC_ProfilePasswordPolicy } from './data/orgcheck-api-data-profilepasswordpolicy';
import { SFDC_ProfileRestrictions } from './data/orgcheck-api-data-profilerestrictions';
import { SFDC_User } from './data/orgcheck-api-data-user';
import { SFDC_RecordType } from './data/orgcheck-api-data-recordtype';
import { SFDC_UserRole } from './data/orgcheck-api-data-userrole';
import { SFDC_ValidationRule } from './data/orgcheck-api-data-validationrule';
import { SFDC_VisualForceComponent } from './data/orgcheck-api-data-visualforcecomponent';
import { SFDC_VisualForcePage } from './data/orgcheck-api-data-visualforcepage';
import { SFDC_Workflow } from './data/orgcheck-api-data-workflow';

/**
 * @description Org Check API main class
 */
export class API {

    /**
     * @description String representation of the Org Check version in a form of Element [El,n]
     * @type {string}
     * @public
     */
    get version() {
        return 'Boron [B,5]';
    }

    /**
     * @description Numerical representation of the Salesforce API Version we use
     * @type {number}
     * @public
     */
    get salesforceApiVersion() {
        return this._sfdcManager.apiVersion;
    }
    
    /**
     * @description Private Recipe Manager property used to run a recipe given its alias
     * @type {RecipeManagerIntf} 
     * @private
     */
    _recipeManager;

    /**
     * @description Private Dataset Manager property used to run a dataset given its alias
     * @type {DatasetManagerIntf}
     * @private
     */
    _datasetManager;

    /**
     * @description Private Salesforce Manager property used to call the salesforce APIs using JsForce framework
     * @type {SalesforceManagerIntf}
     * @private
     */
    _sfdcManager;

    /**
     * @description Private data cache manager to store data from datasetManager
     * @type {DataCacheManagerIntf}
     * @private
     */
    _cacheManager;

    /**
     * @description Private Logger property used to send log information to the UI (if any)
     * @type {LoggerIntf}
     * @private
     */
    _logger;

    /**
     * @description Is the current user accepted the terms manually to use Org Check in this org?
     * @type {boolean}
     * @private
     */
    _usageTermsAcceptedManually;

    /**
     * @description Org Check constructor
     * @param {string} accessToken
     * @param {any} jsConnectionFactory
     * @param {{setItem: function, getItem: function, removeItem: function, key: function, keys: function, length: function}} jsLocalStorage
     * @param {{encode: function, decode: function}} jsEncoding
     * @param {{compress: function, decompress: function}} jsCompressing
     * @param {BasicLoggerIntf} loggerSetup
     */
    constructor(accessToken, jsConnectionFactory, jsLocalStorage, jsEncoding, jsCompressing, loggerSetup) {
        this._logger = new Logger(loggerSetup);
        this._sfdcManager = new SalesforceManager(jsConnectionFactory, accessToken); 
        this._cacheManager = new DataCacheManager({
            compress:   jsCompressing.compress,
            decompress: jsCompressing.decompress,
            encode:     jsEncoding.encode,
            decode:     jsEncoding.decode,
            storage:    jsLocalStorage
        });
        this._datasetManager = new DatasetManager(this._sfdcManager, this._cacheManager, this._logger);
        this._recipeManager = new RecipeManager(this._datasetManager, this._logger);
        this._usageTermsAcceptedManually = false;
    }
    
    /**
     * @description Remove all cache from dataset manager
     * @public
     */
    removeAllFromCache() {
        this._cacheManager.clear();
    }

    /**
     * @description Get cache information from dataset manager
     * @returns {Array<DataCacheItem>} list of cache information 
     * @public
     */
    getCacheInformation() {
        return this._cacheManager.details();
    }

    /**
     * @description Get the information of the given Org Check "Score Rule"
     * @param {number} id
     * @returns {ScoreRule} Information about a score rule
     * @public
     */
    getScoreRule(id) {
        return SecretSauce.AllScoreRules[id];
    }

    /**
     * @description Get the list of all Org Check "score rules"
     * @returns {Array<ScoreRule>} Information about score rules
     * @public
     */
    getAllScoreRules() {
        return SecretSauce.AllScoreRules;
    }

    /**
     * @description Get the list of all Org Check "score rules" as a matrix
     * @returns {DataMatrix} Information about score rules as a matrix
     * @public
     */
    getAllScoreRulesAsDataMatrix() {
        const workingMatrix = DataMatrixFactory.create();
        SecretSauce.AllScoreRules.forEach((rule) => {
            workingMatrix.setRowHeader(`${rule.id}`, rule);
            rule.applicable.forEach((classs) => {
                workingMatrix.addValueToProperty(
                    `${rule.id}`,
                    classs.label,
                    'true'
                );
            });
        });
        return workingMatrix.toDataMatrix();
    }

    /**
     * @description Get the lastest Daily API Usage from JSForce, and the level of confidence we have in this ratio to continue using org check.
     * @returns {SalesforceUsageInformation} Percentage of the daily api usage and a confidence precentage.
     * @public
     */
    get dailyApiRequestLimitInformation() {
        return this._sfdcManager.dailyApiRequestLimitInformation;
    }

    /**
     * @description Send a request to run all tests in the org. When this method is finished, it does not mean all tests are run.
     * @returns {Promise<string>} The Salesforce Id of the AsyncApexJob
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    async runAllTestsAsync() {
        return this._sfdcManager.runAllTests(this._logger.toSimpleLogger('Run All Tests'));
    }

    /**
     * @description Compile the given list of Apex Classes and return the status of the compilation
     * @param {Array<string>} apexClassIds
     * @returns {Promise}
     * @async
     * @public
     */
    async compileClasses(apexClassIds) {
        return this._sfdcManager.compileClasses(apexClassIds, this._logger.toSimpleLogger(`Compile ${apexClassIds.length} class(es)`));
    }

    /**
     * @description Get information about the organization
     * @returns {Promise<SFDC_Organization>} Org information to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    async getOrganizationInformation() {
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
    async checkUsageTerms() {
        const orgInfo = (await this.getOrganizationInformation());
        if (orgInfo.isProduction === true && this._usageTermsAcceptedManually === false) {
            return false;
        }
        return true;
    }

    /**
     * @description Returns if the usage terms were accepted manually
     * @public
     */
    wereUsageTermsAcceptedManually() {
        return this._usageTermsAcceptedManually;
    }

    /**
     * @description Accept manually the usage terms
     * @public
     */
    acceptUsageTermsManually() {
        this._usageTermsAcceptedManually = true;
    }

    /**
     * @description Check if the current user can run the application
     * @returns {Promise<boolean>} true if this user can run the application. Never returns false (see exception)
     * @throws Exception if not enough permissions to run the application
     * @async
     * @public
     */
    async checkCurrentUserPermissions() {
        // @ts-ignore
        const /** @type {Map} */ perms = (await this._recipeManager.run(RecipeAliases.CURRENT_USER_PERMISSIONS, [ 'ModifyAllData','AuthorApex','ApiEnabled','InstallPackaging' ]));
        if (perms.get('ModifyAllData') === false || perms.get('AuthorApex')       === false ||
            perms.get('ApiEnabled')    === false || perms.get('InstallPackaging') === false) {
                throw (new TypeError(
                    'Current User Permission Access is not enough to run the application <br /><br />'+
                    `- <b>Modify All Data</b> (Create, edit, and delete all organization data, regardless of sharing settings) [PermissionsModifyAllData] is set to ${perms.get('PermissionsModifyAllData')} <br />`+
                    `- <b>Author Apex</b> (Create Apex classes and triggers) [PermissionsAuthorApex] is set to ${perms.get('PermissionsAuthorApex')} <br />`+
                    `- <b>API Enabled</b> (Access any Salesforce.com API) [PermissionsApiEnabled] is set to ${perms.get('PermissionsApiEnabled')} <br />`+
                    `- <b>Download AppExchange Packages</b> (Install or uninstall AppExchange packages as system administrators) [PermissionsInstallPackaging] is set to ${perms.get('PermissionsInstallPackaging')} <br />`
                ));
        }
        return true;
    }

    /**
     * @description Get information about the packages
     * @returns {Promise<Array<SFDC_Package>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    async getPackages() {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.PACKAGES));
    }

    /**
     * @description Remove all the cached information about packages
     * @public
     */
    removeAllPackagesFromCache() {
        this._recipeManager.clean(RecipeAliases.PACKAGES);
    }

    /**
     * @description Get information about the page layouts
     * @param {string} namespace 
     * @param {string} sobjectType 
     * @param {string} sobject 
     * @returns {Promise<Array<SFDC_PageLayout>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    async getPageLayouts(namespace, sobjectType, sobject) {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.PAGE_LAYOUTS, namespace, sobjectType, sobject));
    }

    /**
     * @description Remove all the cached information about page layouts
     * @public
     */
    removeAllPageLayoutsFromCache() {
        this._recipeManager.clean(RecipeAliases.PAGE_LAYOUTS);
    }

    /**
     * @description Get information about the object types
     * @returns {Promise<Array<SFDC_ObjectType>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    async getObjectTypes() {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.OBJECT_TYPES));
    }

    /**
     * @description Get information about the objects 
     * @param {string} namespace 
     * @param {string} sobjectType 
     * @returns {Promise<Array<SFDC_Object>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    async getObjects(namespace, sobjectType) {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.OBJECTS, namespace, sobjectType));
    }

    /**
     * @description Remove all the cached information about objects
     * @public
     */
    removeAllObjectsFromCache() {
        this._recipeManager.clean(RecipeAliases.OBJECTS);
    }

    /**
     * @description Get information about a specific sobject
     * @param {string} sobject
     * @returns {Promise<SFDC_Object>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    async getObject(sobject) {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.OBJECT, sobject));
    }

    /**
     * @description Remove all the cached information about a specific sobject
     * @param {string} sobject
     * @public
     */
    removeObjectFromCache(sobject) {
        this._recipeManager.clean(RecipeAliases.OBJECT, sobject);
    }

    /**
     * @description Get information about object permissions per parent (kind of matrix view)
     * @param {string} namespace 
     * @returns {Promise<DataMatrix>} Information about objects (list of string) and permissions (list of SFDC_ObjectPermissionsPerParent)
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    async getObjectPermissionsPerParent(namespace) {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.OBJECT_PERMISSIONS, namespace));
    }

    /**
     * @description Remove all the cached information about object permissions
     * @public
     */
    removeAllObjectPermissionsFromCache() {
        this._recipeManager.clean(RecipeAliases.OBJECT_PERMISSIONS);
    }

    /**
     * @description Get information about application permissions per parent (kind of matrix view)
     * @param {string} namespace 
     * @returns {Promise<DataMatrix>} Information about applications (list of string) and permissions (list of SFDC_AppPermissionsPerParent)
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    async getApplicationPermissionsPerParent(namespace) {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.APP_PERMISSIONS, namespace));
    }

    /**
     * @description Remove all the cached information about application permissions
     * @public
     */
    removeAllAppPermissionsFromCache() {
        this._recipeManager.clean(RecipeAliases.APP_PERMISSIONS);
    }

    /**
     * @description Get information about custom fields (filtered out by namespace/pakage, type and sobject)
     * @param {string} namespace 
     * @param {string} sobjectType 
     * @param {string} sobject 
     * @returns {Promise<Array<SFDC_Field>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    async getCustomFields(namespace, sobjectType, sobject) {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.CUSTOM_FIELDS, namespace, sobjectType, sobject));
    }

    /**
     * @description Remove all the cached information about custom fields
     * @public
     */
    removeAllCustomFieldsFromCache() {
        this._recipeManager.clean(RecipeAliases.CUSTOM_FIELDS);
    }

    /**
     * @description Get information about permission sets (filtered out by namespace/pakage)
     * @param {string} namespace 
     * @returns {Promise<Array<SFDC_PermissionSet>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    async getPermissionSets(namespace) {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.PERMISSION_SETS, namespace));
    }
    
    /**
     * @description Remove all the cached information about permission sets
     * @public
     */
    removeAllPermSetsFromCache() {
        this._recipeManager.clean(RecipeAliases.PERMISSION_SETS);
    }

    /**
     * @description Get information about permission set licenses
     * @returns {Promise<Array<SFDC_PermissionSetLicense>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    async getPermissionSetLicenses() {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.PERMISSION_SET_LICENSES));
    }
    
    /**
     * @description Remove all the cached information about permission set licenses
     * @public
     */
    removeAllPermSetLicensesFromCache() {
        this._recipeManager.clean(RecipeAliases.PERMISSION_SET_LICENSES);
    }

    /**
     * @description Get information about profiles (filtered out by namespace/pakage)
     * @param {string} namespace 
     * @returns {Promise<Array<SFDC_Profile>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    async getProfiles(namespace) {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.PROFILES, namespace));
    }

    /**
     * @description Remove all the cached information about profiles
     * @public
     */
    removeAllProfilesFromCache() {
        this._recipeManager.clean(RecipeAliases.PROFILES);
    }

    /**
     * @description Get information about profile restrictions (filtered out by namespace/pakage)
     * @param {string} namespace 
     * @returns {Promise<Array<SFDC_ProfileRestrictions>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    async getProfileRestrictions(namespace) {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.PROFILE_RESTRICTIONS, namespace));
    }

    /**
     * @description Remove all the cached information about profile restrictions
     * @public
     */
    removeAllProfileRestrictionsFromCache() {
        this._recipeManager.clean(RecipeAliases.PROFILE_RESTRICTIONS);
    }

    /**
     * @description Get information about profile password policies
     * @returns {Promise<Array<SFDC_ProfilePasswordPolicy>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    async getProfilePasswordPolicies() {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.PROFILE_PWD_POLICIES));
    }

    /**
     * @description Remove all the cached information about profile password policies
     * @public
     */
    removeAllProfilePasswordPoliciesFromCache() {
        this._recipeManager.clean(RecipeAliases.PROFILE_PWD_POLICIES);
    }

    /**
     * @description Get information about active users
     * @returns {Promise<Array<SFDC_User>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    async getActiveUsers() {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.ACTIVE_USERS));
    }

    /**
     * @description Remove all the cached information about active users
     * @public
     */
    removeAllActiveUsersFromCache() {
        this._recipeManager.clean(RecipeAliases.ACTIVE_USERS);
    }

    /**
     * @description Get information about custom labels (filtered out by namespace/pakage)
     * @param {string} namespace 
     * @returns {Promise<Array<SFDC_CustomLabel>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    async getCustomLabels(namespace) {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.CUSTOM_LABELS, namespace));
    }

    /**
     * @description Remove all the cached information about custom labels
     * @public
     */
    removeAllCustomLabelsFromCache() {
        this._recipeManager.clean(RecipeAliases.CUSTOM_LABELS);
    }


    /**
     * @description Get information about documents (filtered out by namespace/pakage)
     * @param {string} namespace 
     * @returns {Promise<Array<SFDC_Document>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    async getDocuments(namespace) {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.DOCUMENTS, namespace));
    }

    /**
     * @description Remove all the cached information about documents
     * @public
     */
    removeAllDocumentsFromCache() {
        this._recipeManager.clean(RecipeAliases.DOCUMENTS);
    }

    /**
     * @description Get information about LWCs (filtered out by namespace/pakage)
     * @param {string} namespace 
     * @returns {Promise<Array<SFDC_LightningWebComponent>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    async getLightningWebComponents(namespace) {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.LIGHTNING_WEB_COMPONENTS, namespace));
    }
    
    /**
     * @description Remove all the cached information about lightning web components
     * @public
     */
    removeAllLightningWebComponentsFromCache() {
        this._recipeManager.clean(RecipeAliases.LIGHTNING_WEB_COMPONENTS);
    }

    /**
     * @description Get information about Aura Components (filtered out by namespace/pakage)
     * @param {string} namespace 
     * @returns {Promise<Array<SFDC_LightningAuraComponent>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    async getLightningAuraComponents(namespace) {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.LIGHTNING_AURA_COMPONENTS, namespace));
    }

    /**
     * @description Remove all the cached information about lightning aura components
     * @public
     */
    removeAllLightningAuraComponentsFromCache() {
        this._recipeManager.clean(RecipeAliases.LIGHTNING_AURA_COMPONENTS);
    }

    /**
     * @description Get information about flexipages (filtered out by namespace/pakage)
     * @param {string} namespace 
     * @returns {Promise<Array<SFDC_LightningPage>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    async getLightningPages(namespace) {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.LIGHTNING_PAGES, namespace));
    }

    /**
     * @description Remove all the cached information about lightning pages
     * @public
     */
    removeAllLightningPagesFromCache() {
        this._recipeManager.clean(RecipeAliases.LIGHTNING_PAGES);
    }
    
    /**
     * @description Get information about VFCs (filtered out by namespace/pakage)
     * @param {string} namespace 
     * @returns {Promise<Array<SFDC_VisualForceComponent>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    async getVisualForceComponents(namespace) {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.VISUALFORCE_COMPONENTS, namespace));
    }
    
    /**
     * @description Remove all the cached information about Visualforce Components
     * @public
     */
    removeAllVisualForceComponentsFromCache() {
        this._recipeManager.clean(RecipeAliases.VISUALFORCE_COMPONENTS);
    }

    /**
     * @description Get information about VFPs (filtered out by namespace/pakage)
     * @param {string} namespace 
     * @returns {Promise<Array<SFDC_VisualForcePage>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    async getVisualForcePages(namespace) {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.VISUALFORCE_PAGES, namespace));
    }

    /**
     * @description Remove all the cached information about Visualforce Pages
     * @public
     */
    removeAllVisualForcePagesFromCache() {
        this._recipeManager.clean(RecipeAliases.VISUALFORCE_PAGES);
    }
    
    /**
     * @description Get information about Public Groups
     * @returns {Promise<Array<SFDC_Group>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    async getPublicGroups() {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.PUBLIC_GROUPS));
    }

    /**
     * @description Remove all the cached information about public groups
     * @public
     */
    removeAllPublicGroupsFromCache() {
        this._recipeManager.clean(RecipeAliases.PUBLIC_GROUPS);
    }

    /**
     * @description Get information about Queues
     * @returns {Promise<Array<SFDC_Group>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    async getQueues() {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.QUEUES));
    }

    /**
     * @description Remove all the cached information about queues
     * @public
     */
    removeAllQueuesFromCache() {
        this._recipeManager.clean(RecipeAliases.QUEUES);
    }

    /**
     * @description Get information about Apex Classes (filtered out by namespace/pakage)
     * @param {string} namespace 
     * @returns {Promise<Array<SFDC_ApexClass>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    async getApexClasses(namespace) {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.APEX_CLASSES, namespace));
    }

    /**
     * @description Remove all the cached information about apex classes
     * @public
     */
    removeAllApexClassesFromCache() {
        this._recipeManager.clean(RecipeAliases.APEX_CLASSES);
    }
    
    /**
     * @description Get information about Apex Tests (filtered out by namespace/pakage)
     * @param {string} namespace 
     * @returns {Promise<Array<SFDC_ApexClass>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    async getApexTests(namespace) {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.APEX_TESTS, namespace));
    }

    /**
     * @description Remove all the cached information about apex tests
     * @public
     */
    removeAllApexTestsFromCache() {
        this._recipeManager.clean(RecipeAliases.APEX_TESTS);
    }

    /**
     * @description Get information about Apex triggers (filtered out by namespace/pakage)
     * @param {string} namespace 
     * @returns {Promise<Array<SFDC_ApexTrigger>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    async getApexTriggers(namespace) {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.APEX_TRIGGERS, namespace));
    }

    /**
     * @description Remove all the cached information about apex triggers
     * @public
     */
    removeAllApexTriggersFromCache() {
        this._recipeManager.clean(RecipeAliases.APEX_TRIGGERS);
    }

    /**
     * @description Get information about Apex Uncompiled Classes (filtered out by namespace/pakage)
     * @param {string} namespace 
     * @returns {Promise<Array<SFDC_ApexClass>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    async getApexUncompiled(namespace) {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.APEX_UNCOMPILED, namespace));
    }

    /**
     * @description Remove all the cached information about apex uncompiled classes
     * @public
     */
    removeAllApexUncompiledFromCache() {
        this._recipeManager.clean(RecipeAliases.APEX_UNCOMPILED);
    }

    /**
     * @description Get information about User roles in a tabular view
     * @returns {Promise<Array<SFDC_UserRole>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    async getRoles() {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.USER_ROLES));
    }

    /**
     * @description Remove all the cached information about roles
     * @public
     */
    removeAllRolesFromCache() {
        this._recipeManager.clean(RecipeAliases.USER_ROLES);
    }

    /**
     * @description Get information about User Roles in a tree view
     * @returns {Promise<SFDC_UserRole>} Tree
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    async getRolesTree() {
        // Get data
        const allRoles = (await this.getRoles());
        // @ts-ignore
        // Create a map that stores all nodes
        // Where:
        //   - key is the id of the node (string)
        //   - value is the node with properties: 
        //        * 'id' (mandatory string), 
        //        * 'children' (optional array), and,
        //        * 'record' (undefined for root, mandatory for other than root -- of type: SFDC_UserRole)
        const allNodes = new Map();
        // Key for artificial ROOT
        const ROOT_KEY = '__i am root__';
        // Note that 'allRoles' is an 'Array'
        allRoles.forEach((role) => { 
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
     * @description Get information about Workflows
     * @returns {Promise<Array<SFDC_Workflow>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    async getWorkflows() {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.WORKFLOWS));
    }

    /**
     * @description Remove all the cached information about workflows
     * @public
     */
    removeAllWorkflowsFromCache() {
        this._recipeManager.clean(RecipeAliases.WORKFLOWS);
    }

    /**
     * @description Get information about record types
     * @param {string} namespace 
     * @param {string} sobjectType 
     * @param {string} sobject 
     * @returns {Promise<Array<SFDC_RecordType>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    async getRecordTypes(namespace, sobjectType, sobject) {
        // @ts-ignore    
        return (await this._recipeManager.run(RecipeAliases.RECORD_TYPES, namespace, sobjectType, sobject));
    }

    /**
     * @description Remove all the cached information about record types
     * @public
     */
    removeAllRecordTypesFromCache() {
        this._recipeManager.clean(RecipeAliases.RECORD_TYPES);
    }

    /**
     * @description Get information about field permissions per parent (kind of matrix view) for a specific sobject
     * @param {string} sobject
     * @param {string} namespace
     * @returns {Promise<DataMatrix>} Information about fields (list of string) and permissions (list of SFDC_FieldPermissionsPerParent)
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    async getFieldPermissionsPerParent(sobject, namespace) {
        // @ts-ignore    
        return (await this._recipeManager.run(RecipeAliases.FIELD_PERMISSIONS, sobject, namespace));
    }

    /**
     * @description Remove all the cached information about field permissions
     * @public
     */
    removeAllFieldPermissionsFromCache() {
        this._recipeManager.clean(RecipeAliases.FIELD_PERMISSIONS);
    }

    /**
     * @description Get information about Flows
     * @returns {Promise<Array<SFDC_Flow>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    async getFlows() {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.FLOWS));
    }

    /**
     * @description Remove all the cached information about flows
     * @public
     */
    removeAllFlowsFromCache() {
        this._recipeManager.clean(RecipeAliases.FLOWS);
    }
    
    /**
     * @description Get information about Process Builders
     * @returns {Promise<Array<SFDC_Flow>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    async getProcessBuilders() {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.PROCESS_BUILDERS));
    }

    /**
     * @description Remove all the cached information about process builders
     * @public
     */
    removeAllProcessBuildersFromCache() {
        this._recipeManager.clean(RecipeAliases.PROCESS_BUILDERS);
    }
    
    /**
     * @description Get information about Validation rules
     * @param {string} namespace 
     * @param {string} sobjectType 
     * @param {string} sobject 
     * @returns {Promise<Array<SFDC_ValidationRule>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    async getValidationRules(namespace, sobjectType, sobject) {
        // @ts-ignore
        return (await this._recipeManager.run(RecipeAliases.VALIDATION_RULES, namespace, sobjectType, sobject));
    }
    
    /**
     * @description Remove all the cached information about validation rules
     * @public
     */
    removeAllValidationRulesFromCache() {
        this._recipeManager.clean(RecipeAliases.VALIDATION_RULES);
    }
}