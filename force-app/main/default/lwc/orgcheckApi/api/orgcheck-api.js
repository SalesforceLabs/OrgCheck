import { OrgCheckSalesforceManager } from './core/orgcheck-api-sfconnectionmanager';
import { OrgCheckLogger } from './core/orgcheck-api-logger';
import { OrgCheckDatasetManager } from './core/orgcheck-api-datasetmanager';
import { OrgCheckRecipeManager,
    RECIPE_ACTIVEUSERS_ALIAS,
    RECIPE_CUSTOMFIELDS_ALIAS, 
    RECIPE_CUSTOMLABELS_ALIAS,
    RECIPE_GLOBALFILTERS_ALIAS,
    RECIPE_OBJECT_ALIAS,
    RECIPE_ORGINFO_ALIAS,
    RECIPE_PERMISSIONSETS_ALIAS,
    RECIPE_PROFILES_ALIAS,
    RECIPE_VISUALFORCEPAGES_ALIAS } from './core/orgcheck-api-recipemanager';

/**
 * Org Check API main class
 */
export class OrgCheckAPI {

    /**
     * Org Check version
     * 
     * @return String representation of the Org Check version in a form of Element [El,n]
     */
    version() {
        return 'Beryllium [Be,4]';
    }

    /**
     * @property {OrgCheckRecipeManager} recipeManager
     */
    #recipeManager;

    /**
     * @property {OrgCheckDatasetManager} datasetManager
     */
    #datasetManager;

    /**
     * @property {OrgCheckSalesforceManager} sfdcManager
     */
    #sfdcManager;

    /**
     * @property {OrgCheckLogger} logger
     */
    #logger;

    /**
     * Org Check constructor
     * 
     * @param {JsForce} jsConnectionFactory
     * @param {String} accessToken
     * @param {String} userId
     * @param {JSon} loggerSetup
     */
    constructor(jsConnectionFactory, accessToken, userId, loggerSetup) {
        this.#sfdcManager = new OrgCheckSalesforceManager(jsConnectionFactory, accessToken, userId);
        this.#logger = new OrgCheckLogger(loggerSetup);
        this.#datasetManager = new OrgCheckDatasetManager(this.#sfdcManager, this.#logger);
        this.#recipeManager = new OrgCheckRecipeManager(this.#datasetManager, this.#logger);
    }

    /**
     * Remove all cache from dataset manager
     */
    removeAllCache() {
        this.#datasetManager.removeAllCache();
    }

    /**
     * Remove a given cache from dataset manager
     * 
     * @param {string} name 
     */
    removeCache(name) {
        this.#datasetManager.removeCache(name);
    }

    /**
     * Get cache information from dataset manager
     * 
     * @returns {Array<DatasetCacheInfo>} list of cache information 
     */
    getCacheInformation() {
        return this.#datasetManager.getCacheInformation();
    }

    /**
     * Get the lastest Daily API Usage from JSForce
     * 
     * @returns Ratio of the daily api usage.
     */
    getOrgDailyApiLimitRate() {
        return this.#sfdcManager.getOrgLimits();
    }
    
    async getPackagesTypesAndObjects(namespace, sobjectType) {
        return this.#recipeManager.run(RECIPE_GLOBALFILTERS_ALIAS, namespace, sobjectType);
    }

    async getObject(sobject) {
        return this.#recipeManager.run(RECIPE_OBJECT_ALIAS, sobject);
    }

    async getCustomFields(namespace, sobjectType, sobject) {
        return this.#recipeManager.run(RECIPE_CUSTOMFIELDS_ALIAS, namespace, sobjectType, sobject);
    }

    async getPermissionSets(namespace) {
        return this.#recipeManager.run(RECIPE_PERMISSIONSETS_ALIAS, namespace);
    }

    async getProfiles(namespace) {
        return this.#recipeManager.run(RECIPE_PROFILES_ALIAS, namespace);
    }

    async getActiveUsers() {
        return this.#recipeManager.run(RECIPE_ACTIVEUSERS_ALIAS);
    }

    async getCustomLabels(namespace) {
        return this.#recipeManager.run(RECIPE_CUSTOMLABELS_ALIAS, namespace);
    }

    async getVisualForcePages(namespace) {
        return this.#recipeManager.run(RECIPE_VISUALFORCEPAGES_ALIAS, namespace);
    }

    async getOrgInformation() {
        return this.#recipeManager.run(RECIPE_ORGINFO_ALIAS);
    }
}