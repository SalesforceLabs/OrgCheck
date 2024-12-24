// @ts-check

import { DailyApiRequestLimitInformation, OrgCheckSalesforceManager } from './core/orgcheck-api-sfconnectionmanager';
import { OrgCheckLogger } from './core/orgcheck-api-logger';
import { OrgCheckDatasetManager } from './core/orgcheck-api-datasetmanager';
import { OrgCheckRecipeManager, RECIPE_ACTIVEUSERS_ALIAS, RECIPE_CUSTOMFIELDS_ALIAS, 
    RECIPE_CUSTOMLABELS_ALIAS, RECIPE_OBJECT_ALIAS, RECIPE_OBJECTPERMISSIONS_ALIAS,
    RECIPE_APPPERMISSIONS_ALIAS, RECIPE_ORGANIZATION_ALIAS, RECIPE_CURRENTUSERPERMISSIONS_ALIAS,
    RECIPE_PERMISSIONSETS_ALIAS, RECIPE_PROFILES_ALIAS, RECIPE_PROFILERESTRICTIONS_ALIAS,
    RECIPE_PROFILEPWDPOLICIES_ALIAS, RECIPE_VISUALFORCEPAGES_ALIAS,
    RECIPE_LIGHTNINGPWEBCOMPONENTS_ALIAS, RECIPE_LIGHTNINGAURACOMPONENTS_ALIAS,
    RECIPE_LIGHTNINGPAGES_ALIAS, RECIPE_VISUALFORCECOMPONENTS_ALIAS, RECIPE_GROUPS_ALIAS, 
    RECIPE_APEXCLASSES_ALIAS, RECIPE_APEXTRIGGERS_ALIAS, RECIPE_USERROLES_ALIAS,
    RECIPE_FLOWS_ALIAS, RECIPE_PROCESSBUILDERS_ALIAS, RECIPE_WORKFLOWS_ALIAS, 
    RECIPE_PACKAGES_ALIAS,
    RECIPE_OBJECTTYPES_ALIAS,
    RECIPE_OBJECTS_ALIAS} from './core/orgcheck-api-recipemanager';
import { OrgCheckDataCacheItem } from './core/orgcheck-api-datacache';
import { OrgCheckValidationRule } from './core/orgcheck-api-datafactory';
import { SFDC_ApexClass } from './data/orgcheck-api-data-apexclass';
import { SFDC_ApexTrigger } from './data/orgcheck-api-data-apextrigger';
import { SFDC_CustomLabel } from './data/orgcheck-api-data-customlabel';
import { SFDC_Field } from './data/orgcheck-api-data-field';
import { SFDC_Flow } from './data/orgcheck-api-data-flow';
import { SFDC_Group } from './data/orgcheck-api-data-group';
import { SFDC_LightningAuraComponent } from './data/orgcheck-api-data-lightningauracomponent';
import { SFDC_LightningPage } from './data/orgcheck-api-data-lightningpage';
import { SFDC_LightningWebComponent } from './data/orgcheck-api-data-lightningwebcomponent';
import { SFDC_Object } from './data/orgcheck-api-data-object';
import { SFDC_Organization } from './data/orgcheck-api-data-organization';
import { SFDC_Profile } from './data/orgcheck-api-data-profile';
import { SFDC_ProfilePasswordPolicy } from './data/orgcheck-api-data-profilepasswordpolicy';
import { SFDC_User } from './data/orgcheck-api-data-user';
import { SFDC_UserRole } from './data/orgcheck-api-data-userrole';
import { SFDC_VisualForceComponent } from './data/orgcheck-api-data-visualforcecomponent';
import { SFDC_VisualForcePage } from './data/orgcheck-api-data-visualforcepage';
import { SFDC_Workflow } from './data/orgcheck-api-data-workflow';
import { SFDC_Package } from './data/orgcheck-api-data-package';
import { SFDC_ObjectType } from './data/orgcheck-api-data-objecttype';
import { OrgCheckData } from './core/orgcheck-api-data';
import { SFDC_ObjectPermission } from './data/orgcheck-api-data-objectpermission';
import { SFDC_ProfileRestrictions } from './data/orgcheck-api-data-profilerestrictions';

/**
 * @description Org Check API main class
 * @property {string} version - String representation of the Org Check version in a form of Element [El,n]
 */
export class OrgCheckAPI {

    /**
     * @description String representation of the Org Check version in a form of Element [El,n]
     * @type {string}
     * @public
     */
    get version() {
        return 'Beryllium [Be,4]';
    }

    /**
     * @description Private Recipe Manager property used to run a recipe given its alias
     * @type {OrgCheckRecipeManager} 
     * @private
     */
    private_recipeManager;

    /**
     * @description Private Dataset Manager property used to run a dataset given its alias
     * @type {OrgCheckDatasetManager}
     * @private
     */
    private_datasetManager;

    /**
     * @description Private Salesforce Manager property used to call the salesforce APIs using JsForce framework
     * @type {OrgCheckSalesforceManager}
     * @private
     */
    private_sfdcManager;

    /**
     * @description Private Logger property used to send log information to the UI (if any)
     * @type {OrgCheckLogger}
     * @private
     */
    private_logger;

    /**
     * @description Is the current user accepted the terms to use Org Check in this org?
     * @type {boolean}
     */
    private_usageTermsAccepted;

    /**
     * @description Org Check constructor
     * @param {any} jsConnectionFactory
     * @param {any} jsCompression
     * @param {string} accessToken
     * @param {string} userId
     * @param {any} loggerSetup
     */
    constructor(jsConnectionFactory, jsCompression, accessToken, userId, loggerSetup) {
        this.private_logger = new OrgCheckLogger(loggerSetup);
        this.private_sfdcManager = new OrgCheckSalesforceManager(jsConnectionFactory, accessToken); //, userId, this.private_logger);
        this.private_datasetManager = new OrgCheckDatasetManager(this.private_sfdcManager, jsCompression, this.private_logger);
        this.private_recipeManager = new OrgCheckRecipeManager(this.private_datasetManager, this.private_logger);
        this.private_usageTermsAccepted = false;
    }
    
    /**
     * @description Remove all cache from dataset manager
     * @public
     */
    removeAllCache() {
        this.private_datasetManager.removeAllCache();
    }

    /**
     * @description Remove a given cache from dataset manager
     * @param {string} name 
     * @public
     */
    removeCache(name) {
        this.private_datasetManager.removeCache(name);
    }

    /**
     * @description Get cache information from dataset manager
     * @returns {Array<OrgCheckDataCacheItem>} list of cache information 
     * @public
     */
    getCacheInformation() {
        return this.private_datasetManager.getCacheInformation();
    }

    /**
     * @description Get the information of the given Validation Rule
     * @param {string} id
     * @returns {OrgCheckValidationRule} Information about a validation rule
     * @public
     */
    getValidationRule(id) {
        return this.private_datasetManager.getValidationRule(id);
    }

    /**
     * @description Get the lastest Daily API Usage from JSForce, and the level of confidence we have in this ratio to continue using org check.
     * @returns {DailyApiRequestLimitInformation} Percentage of the daily api usage and a confidence precentage.
     * @public
     */
    getDailyApiRequestLimitInformation() {
        return this.private_sfdcManager.getDailyApiRequestLimitInformation();
    }

    /**
     * @description Send a request to run all tests in the org. When this method is finished, it does not mean all tests are run.
     * @returns {Promise<string>} The Salesforce Id of the AsyncApexJob
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    async runAllTestsAsync() {
        return this.private_sfdcManager.runAllTests();
    }

    /**
     * @description Compile the given list of Apex Classes and return the status of the compilation
     * @param {Array<SFDC_ApexClass>} classes
     * @returns {Promise}
     * @async
     * @public
     */
    async compileClasses(classes) {
        return this.private_sfdcManager.compileClasses(classes);
    }

    /**
     * @description Get information about the organization
     * @returns {Promise<SFDC_Organization>} Org information to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    async getOrganizationInformation() {
        const result = await this.private_recipeManager.run(RECIPE_ORGANIZATION_ALIAS);
        if (result instanceof SFDC_Organization) {
            return result;
        }
        throw new TypeError(`The recipe ${RECIPE_ORGANIZATION_ALIAS} did not return an instance of SFDC_Organization`);
    }

    /**
     * @description Check if we can use the current org according to the terms (specially if this is a production org)
     * @returns {Promise<boolean>} true if this org can be used, false otehrwise.
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    async checkUsageTerms() {
        const orgInfo = await this.getOrganizationInformation();
        if (orgInfo.isProduction === true && this.private_usageTermsAccepted === false) {
            return false;
        }
        return true;
    }

    /**
     * @description Set the acceptance of the terms to TRUE
     * @public
     */
    acceptUsageTerms() {
        this.private_usageTermsAccepted = true;
    }

    /**
     * @description Check if the current user can run the application
     * @returns {Promise<boolean>} true if this user can run the application. Never returns false (see exception)
     * @throws Exception if not enough permissions to run the application
     * @async
     * @public
     */
    async checkCurrentUserPermissions() {
        const perms = await this.private_recipeManager.run(RECIPE_CURRENTUSERPERMISSIONS_ALIAS, [ 'ModifyAllData','AuthorApex','ApiEnabled','InstallPackaging' ]);
        if (perms instanceof Map === false) {
            throw new TypeError(`The recipe ${RECIPE_CURRENTUSERPERMISSIONS_ALIAS} did not return an instance of Map`);
        }
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
     * @description Get information about the packages, the object types and objects (used for global filters)
     * @param {string} namespace 
     * @param {string} sobjectType 
     * @returns {Promise<{packages: Array<SFDC_Package>, types: Array<SFDC_ObjectType>, objects: Array<SFDC_Object>}>} Information about packages (list of SFDC_Package), types (list of SFDC_ObjectType) and objects (list of SFDC_Object)
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    async getPackagesTypesAndObjects(namespace, sobjectType) {
        const results = await Promise.all([
            this.private_recipeManager.run(RECIPE_PACKAGES_ALIAS),
            this.private_recipeManager.run(RECIPE_OBJECTTYPES_ALIAS),
            this.private_recipeManager.run(RECIPE_OBJECTS_ALIAS, namespace, sobjectType)
        ]);
        if (results[0] instanceof Array === false) {
            throw new TypeError(`The recipe ${RECIPE_PACKAGES_ALIAS} did not return an instance of Array`);
        }
        if (results[1] instanceof Array === false) {
            throw new TypeError(`The recipe ${RECIPE_OBJECTTYPES_ALIAS} did not return an instance of Array`);
        }
        if (results[2] instanceof Array === false) {
            throw new TypeError(`The recipe ${RECIPE_OBJECTS_ALIAS} did not return an instance of Array`);
        }
        // @ts-ignore
        return { packages: results[0], types: results[1], objects: results[2] };
    }

    /**
     * @description Remove all the cached information about packages, types and objects
     * @public
     */
    removeAllPackagesTypesAndObjectsFromCache() {
        this.private_recipeManager.clean(RECIPE_PACKAGES_ALIAS);
        this.private_recipeManager.clean(RECIPE_OBJECTTYPES_ALIAS);
        this.private_recipeManager.clean(RECIPE_OBJECTS_ALIAS);
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
        const result = await this.private_recipeManager.run(RECIPE_OBJECT_ALIAS, sobject);
        if (result instanceof SFDC_Object === false) {
            throw new TypeError(`The recipe ${RECIPE_OBJECT_ALIAS} did not return an instance of SFDC_Object`);
        }
        return result;
    }

    /**
     * @description Remove all the cached information about a specific sobject
     * @param {string} sobject
     * @public
     */
    removeObjectFromCache(sobject) {
        this.private_recipeManager.clean(RECIPE_OBJECT_ALIAS, sobject);
    }

    /**
     * @description Get information about object permissions per parent (kind of matrix view)
     * @param {string} namespace 
     * @returns {Promise<Array<SFDC_ObjectPermission>>} Information about objects (list of string) and permissions (list of SFDC_ObjectPermissionsPerParent)
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    async getObjectPermissionsPerParent(namespace) {
        const results = this.private_recipeManager.run(RECIPE_OBJECTPERMISSIONS_ALIAS, namespace);
        if (results instanceof Array === false) {
            throw new TypeError(`The recipe ${RECIPE_OBJECTPERMISSIONS_ALIAS} did not return an instance of Array`);
        }
        // @ts-ignore
        return results;
    }

    /**
     * @description Remove all the cached information about object permissions
     * @public
     */
    removeAllObjectPermissionsCache() {
        this.private_recipeManager.clean(RECIPE_OBJECTPERMISSIONS_ALIAS);
    }

    /**
     * @description Get information about application permissions per parent (kind of matrix view)
     * @param {string} namespace 
     * @returns {Promise<OrgCheckMatrixData>} Information about applications (list of string) and permissions (list of SFDC_AppPermissionsPerParent)
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    async getApplicationPermissionsPerParent(namespace) {
        const matrixData = await this.private_recipeManager.run(RECIPE_APPPERMISSIONS_ALIAS, namespace);
        if (matrixData instanceof OrgCheckMatrixData === false) {
            throw new TypeError(`The recipe ${RECIPE_APPPERMISSIONS_ALIAS} did not return an instance of OrgCheckMatrixData`);
        }
        return matrixData;
    }

    /**
     * @description Remove all the cached information about application permissions
     * @public
     */
    removeAllAppPermissionsFromCache() {
        this.private_recipeManager.clean(RECIPE_APPPERMISSIONS_ALIAS);
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
        const results = await this.private_recipeManager.run(RECIPE_CUSTOMFIELDS_ALIAS, namespace, sobjectType, sobject);
        if (results instanceof Array === false) {
            throw new TypeError(`The recipe ${RECIPE_CUSTOMFIELDS_ALIAS} did not return an instance of Array`);
        }
        // @ts-ignore
        return results;
    }

    /**
     * @description Remove all the cached information about custom fields
     * @public
     */
    removeAllCustomFieldsFromCache() {
        this.private_recipeManager.clean(RECIPE_CUSTOMFIELDS_ALIAS);
    }

    /**
     * @description Get information about permission sets (filtered out by namespace/pakage)
     * @param {string} namespace 
     * @returns {Promise<Array<SFDC_Profile>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    async getPermissionSets(namespace) {
        const results = await this.private_recipeManager.run(RECIPE_PERMISSIONSETS_ALIAS, namespace);
        if (results instanceof Array === false) {
            throw new TypeError(`The recipe ${RECIPE_PERMISSIONSETS_ALIAS} did not return an instance of Array`);
        }
        // @ts-ignore
        return results;
    }
    
    /**
     * @description Remove all the cached information about permission sets
     * @public
     */
    removeAllPermSetsFromCache() {
        this.private_recipeManager.clean(RECIPE_PERMISSIONSETS_ALIAS);
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
        const results = await this.private_recipeManager.run(RECIPE_PROFILES_ALIAS, namespace);
        if (results instanceof Array === false) {
            throw new TypeError(`The recipe ${RECIPE_PROFILES_ALIAS} did not return an instance of Array`);
        }
        // @ts-ignore
        return results;
    }

    /**
     * @description Remove all the cached information about profiles
     * @public
     */
    removeAllProfilesFromCache() {
        this.private_recipeManager.clean(RECIPE_PROFILES_ALIAS);
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
        const results = await this.private_recipeManager.run(RECIPE_PROFILERESTRICTIONS_ALIAS, namespace);
        if (results instanceof Array === false) {
            throw new TypeError(`The recipe ${RECIPE_PROFILERESTRICTIONS_ALIAS} did not return an instance of Array`);
        }
        // @ts-ignore
        return results;
    }

    /**
     * @description Remove all the cached information about profile restrictions
     * @public
     */
    removeAllProfileRestrictionsFromCache() {
        this.private_recipeManager.clean(RECIPE_PROFILERESTRICTIONS_ALIAS);
    }

    /**
     * @description Get information about profile password policies
     * @returns {Promise<Array<SFDC_ProfilePasswordPolicy>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    async getProfilePasswordPolicies() {
        const results = await this.private_recipeManager.run(RECIPE_PROFILEPWDPOLICIES_ALIAS);
        if (results instanceof Array === false) {
            throw new TypeError(`The recipe ${RECIPE_PROFILEPWDPOLICIES_ALIAS} did not return an instance of Array`);
        }
        // @ts-ignore
        return results;
    }

    /**
     * @description Remove all the cached information about profile password policies
     * @public
     */
    removeAllProfilePasswordPoliciesFromCache() {
        this.private_recipeManager.clean(RECIPE_PROFILEPWDPOLICIES_ALIAS);
    }

    /**
     * @description Get information about active users
     * @returns {Promise<Array<SFDC_User>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    async getActiveUsers() {
        const results = await this.private_recipeManager.run(RECIPE_ACTIVEUSERS_ALIAS);
        if (results instanceof Array === false) {
            throw new TypeError(`The recipe ${RECIPE_ACTIVEUSERS_ALIAS} did not return an instance of Array`);
        }
        // @ts-ignore
        return results;
    }

    /**
     * @description Remove all the cached information about active users
     * @public
     */
    removeAllActiveUsersFromCache() {
        this.private_recipeManager.clean(RECIPE_ACTIVEUSERS_ALIAS);
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
        const results = await this.private_recipeManager.run(RECIPE_CUSTOMLABELS_ALIAS, namespace);
        if (results instanceof Array === false) {
            throw new TypeError(`The recipe ${RECIPE_CUSTOMLABELS_ALIAS} did not return an instance of Array`);
        }
        // @ts-ignore
        return results;
    }

    /**
     * @description Remove all the cached information about custom labels
     * @public
     */
    removeAllCustomLabelsFromCache() {
        this.private_recipeManager.clean(RECIPE_CUSTOMLABELS_ALIAS);
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
        const results = await this.private_recipeManager.run(RECIPE_LIGHTNINGPWEBCOMPONENTS_ALIAS, namespace);
        if (results instanceof Array === false) {
            throw new TypeError(`The recipe ${RECIPE_LIGHTNINGPWEBCOMPONENTS_ALIAS} did not return an instance of Array`);
        }
        // @ts-ignore
        return results;
    }
    
    /**
     * @description Remove all the cached information about lightning web components
     * @public
     */
    removeAllLightningWebComponentsFromCache() {
        this.private_recipeManager.clean(RECIPE_LIGHTNINGPWEBCOMPONENTS_ALIAS);
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
        const results = await this.private_recipeManager.run(RECIPE_LIGHTNINGAURACOMPONENTS_ALIAS, namespace);
        if (results instanceof Array === false) {
            throw new TypeError(`The recipe ${RECIPE_LIGHTNINGAURACOMPONENTS_ALIAS} did not return an instance of Array`);
        }
        // @ts-ignore
        return results;
    }

    /**
     * @description Remove all the cached information about lightning aura components
     * @public
     */
    removeAllLightningAuraComponentsFromCache() {
        this.private_recipeManager.clean(RECIPE_LIGHTNINGAURACOMPONENTS_ALIAS);
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
        const results = await this.private_recipeManager.run(RECIPE_LIGHTNINGPAGES_ALIAS, namespace);
        if (results instanceof Array === false) {
            throw new TypeError(`The recipe ${RECIPE_LIGHTNINGPAGES_ALIAS} did not return an instance of Array`);
        }
        // @ts-ignore
        return results;
    }

    /**
     * @description Remove all the cached information about lightning pages
     * @public
     */
    removeAllLightningPagesFromCache() {
        this.private_recipeManager.clean(RECIPE_LIGHTNINGPAGES_ALIAS);
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
        const results = await this.private_recipeManager.run(RECIPE_VISUALFORCECOMPONENTS_ALIAS, namespace);
        if (results instanceof Array === false) {
            throw new TypeError(`The recipe ${RECIPE_VISUALFORCECOMPONENTS_ALIAS} did not return an instance of Array`);
        }
        // @ts-ignore
        return results;
    }
    
    /**
     * @description Remove all the cached information about visual force components
     * @public
     */
    removeAllVisualForceComponentsFromCache() {
        this.private_recipeManager.clean(RECIPE_VISUALFORCECOMPONENTS_ALIAS);
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
        const results = await this.private_recipeManager.run(RECIPE_VISUALFORCEPAGES_ALIAS, namespace);
        if (results instanceof Array === false) {
            throw new TypeError(`The recipe ${RECIPE_VISUALFORCEPAGES_ALIAS} did not return an instance of Array`);
        }
        // @ts-ignore
        return results;
    }

    /**
     * @description Remove all the cached information about visual force pages
     * @public
     */
    removeAllVisualForcePagesFromCache() {
        this.private_recipeManager.clean(RECIPE_VISUALFORCEPAGES_ALIAS);
    }
    
    /**
     * @description Get information about Public Groups and Queues
     * @returns {Promise<Array<SFDC_Group>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    async getGroups() {
        const results = await this.private_recipeManager.run(RECIPE_GROUPS_ALIAS);
        if (results instanceof Array === false) {
            throw new TypeError(`The recipe ${RECIPE_GROUPS_ALIAS} did not return an instance of Array`);
        }
        // @ts-ignore
        return results;
    }

    /**
     * @description Remove all the cached information about public groups and queues
     * @public
     */
    removeAllGroups() {
        this.private_recipeManager.clean(RECIPE_GROUPS_ALIAS);
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
        const results = await this.private_recipeManager.run(RECIPE_APEXCLASSES_ALIAS, namespace);
        if (results instanceof Array === false) {
            throw new TypeError(`The recipe ${RECIPE_APEXCLASSES_ALIAS} did not return an instance of Array`);
        }
        // @ts-ignore
        return results;
    }

    /**
     * @description Remove all the cached information about apex classes
     * @public
     */
    removeAllApexClassesFromCache() {
        this.private_recipeManager.clean(RECIPE_APEXCLASSES_ALIAS);
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
        const results = await this.private_recipeManager.run(RECIPE_APEXTRIGGERS_ALIAS, namespace);
        if (results instanceof Array === false) {
            throw new TypeError(`The recipe ${RECIPE_APEXTRIGGERS_ALIAS} did not return an instance of Array`);
        }
        // @ts-ignore
        return results;
    }

    /**
     * @description Remove all the cached information about apex triggers
     * @public
     */
    removeAllApexTriggersFromCache() {
        this.private_recipeManager.clean(RECIPE_APEXTRIGGERS_ALIAS);
    }

    /**
     * @description Get information about User roles in a tabular view
     * @returns {Promise<Array<SFDC_UserRole>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    async getRoles() {
        const results = await this.private_recipeManager.run(RECIPE_USERROLES_ALIAS);
        if (results instanceof Array === false) {
            throw new TypeError(`The recipe ${RECIPE_USERROLES_ALIAS} did not return an instance of Array`);
        }
        // @ts-ignore
        return results;
    }

    /**
     * @description Remove all the cached information about roles
     * @public
     */
    removeAllRolesFromCache() {
        this.private_recipeManager.clean(RECIPE_USERROLES_ALIAS);
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
        const allRoles = await this.getRoles();
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
        const ROOT_KEY = '##i am root##';
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
        const results = await this.private_recipeManager.run(RECIPE_WORKFLOWS_ALIAS);
        if (results instanceof Array === false) {
            throw new TypeError(`The recipe ${RECIPE_WORKFLOWS_ALIAS} did not return an instance of Array`);
        }
        // @ts-ignore
        return results;
    }

    /**
     * @description Remove all the cached information about workflows
     * @public
     */
    removeAllWorkflowsFromCache() {
        this.private_recipeManager.clean(RECIPE_WORKFLOWS_ALIAS);
    }

    /**
     * @description Get information about Flows
     * @returns {Promise<Array<SFDC_Flow>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    async getFlows() {
        const results = await this.private_recipeManager.run(RECIPE_FLOWS_ALIAS);
        if (results instanceof Array === false) {
            throw new TypeError(`The recipe ${RECIPE_FLOWS_ALIAS} did not return an instance of Array`);
        }
        // @ts-ignore
        return results;
    }

    /**
     * @description Remove all the cached information about flows
     * @public
     */
    removeAllFlowsFromCache() {
        this.private_recipeManager.clean(RECIPE_FLOWS_ALIAS);
    }
    
    /**
     * @description Get information about Process Builders
     * @returns {Promise<Array<SFDC_Flow>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    async getProcessBuilders() {
        const results = await this.private_recipeManager.run(RECIPE_PROCESSBUILDERS_ALIAS);
        if (results instanceof Array === false) {
            throw new TypeError(`The recipe ${RECIPE_PROCESSBUILDERS_ALIAS} did not return an instance of Array`);
        }
        // @ts-ignore
        return results;
    }

    /**
     * @description Remove all the cached information about process builders
     * @public
     */
    removeAllProcessBuildersFromCache() {
        this.private_recipeManager.clean(RECIPE_PROCESSBUILDERS_ALIAS);
    }    
}