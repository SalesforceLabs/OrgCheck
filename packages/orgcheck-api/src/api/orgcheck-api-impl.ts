import { LoggerFactoryIntf } from 'src/api/core/logger/orgcheck-api-loggerfactory';
import { DataCacheManagerIntf } from 'src/api/core/cache/orgcheck-api-cachemanager';
import { DataCacheManager } from 'src/api/core/cache/orgcheck-api-cachemanager-impl';
import { DatasetManager } from 'src/api/core/dataset/orgcheck-api-datasetmanager-impl';
import { DatasetManagerIntf } from 'src/api/core/dataset/orgcheck-api-datasetmanager';
import { LoggerFactory } from 'src/api/core/logger/orgcheck-api-loggerfactory-impl';
import { OrgCheckGlobalParameter } from 'src/api/core/orgcheck-api-globalparameter';
import { RecipeAliases } from 'src/api/core/recipe/orgcheck-api-recipes-aliases';
import { RecipeManager } from 'src/api/core/recipe/orgcheck-api-recipemanager-impl';
import { RecipeManagerIntf } from 'src/api/core/recipe/orgcheck-api-recipemanager';
import { SalesforceManager } from 'src/api/core/salesforce/orgcheck-api-salesforcemanager-impl';
import { SalesforceManagerIntf } from 'src/api/core/salesforce/orgcheck-api-salesforcemanager';
import { SalesforceUsageInformationIntf } from 'src/api/core/salesforce/orgcheck-api-limit-usageinformation';
import { SfdcObject } from 'src/api/data/orgcheck-api-data-object';
import { SfdcObjectType } from 'src/api/data/orgcheck-api-data-objecttype';
import { SfdcOrganization } from 'src/api/data/orgcheck-api-data-organization';
import { SfdcPackage } from 'src/api/data/orgcheck-api-data-package';
import { Storage } from 'src/api/core/cache/orgcheck-api-storage-impl';
import { Compressor } from 'src/api/core/cache/orgcheck-api-compressor-impl';
import { ApiSetup, ApiIntf } from 'src/api/orgcheck-api';
import { SfdcObjectAsTable } from 'src/api/recipe/orgcheck-api-recipe-object';
import { DataMatrixIntf, DataWithScore, GlobalViewAsTable, SfdcUserRole } from 'src/orgcheck';
import { DataCollectionStatisticsIntf } from 'src/api/core/data/orgcheck-api-data-datacollectionstats';
import { ExportedTable, Table } from 'src/ui/table/orgcheck-ui-table';
import { CacheItem } from 'src/api/data/orgcheck-api-data-cacheitem';

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
     * @description Salesforce ID of the organization
     * @type {string}
     * @public
     */
    public orgId?: string;

    /**
     * @description Private Recipe Manager property used to run a recipe given its alias
     * @type {RecipeManagerIntf} 
     * @private
     */
    private readonly _recipeManager: RecipeManagerIntf;

    /**
     * @description Private Dataset Manager property used to run a dataset given its alias
     * @type {DatasetManagerIntf}
     * @private
     */
    private readonly _datasetManager: DatasetManagerIntf;

    /**
     * @description Private Salesforce Manager property used to call the salesforce APIs using JsForce framework
     * @type {SalesforceManagerIntf}
     * @private
     */
    private readonly _sfdcManager: SalesforceManagerIntf;

    /**
     * @description Private data cache manager to store data from datasetManager
     * @type {DataCacheManagerIntf}
     * @private
     */
    private readonly _cacheManager: DataCacheManagerIntf;

    /**
     * @description Private Logger factory
     * @type {LoggerFactoryIntf}
     * @private
     */
    private readonly _loggerFactory: LoggerFactoryIntf;

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
        this._loggerFactory = new LoggerFactory(setup?.logSettings);

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
        this._datasetManager = new DatasetManager(this._sfdcManager, this._cacheManager, this._loggerFactory);
        this._recipeManager = new RecipeManager(this._datasetManager, this._loggerFactory);
        this._usageTermsAcceptedManually = false;
    }
    
    // -----------------------
    // CACHE
    // -----------------------

    /**
     * @description Clear all dataset cache
     * @public
     */
    public clearCache() {
        this._cacheManager.clear();
    }

    /**
     * @description List all the items in the cache manager
     * @returns {CacheItem[]} list of cache information 
     * @public
     */
    public listCacheItems(): CacheItem[] {
        return this._cacheManager.details();
    }

    /**
     * @description Get cache item from cache manager
     * @param {string} itemName - the name of the cache item to get
     * @returns {any} cached item 
     * @public
     */
    public getCacheItem(itemName: string): unknown {
        return this._cacheManager.get(itemName);
    }

    // -----------------------
    // ORG LIMIT & ACCESS
    // -----------------------

    /**
     * @description Get information about the organization
     * @returns {Promise<SfdcOrganization>} Org information to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async getOrganizationInformation(): Promise<SfdcOrganization> {
        // DO NOT CALL _throwExceptionIfUsageTermsNotAccepted
        const logger = this._loggerFactory?.create('Get Organization Information', false);
        try {
            logger?.log(`Calling the prepare method for recipe: ${RecipeAliases.ORGANIZATION}`);
            // @ts-expect-error: prepare() returns a broad union type, but ORGANIZATION recipe always resolves to SfdcOrganization at runtime
            const org: SfdcOrganization = (await this._recipeManager.prepare(RecipeAliases.ORGANIZATION, undefined, logger?.toSimpleLogger()));
            this.orgId = org?.id;
            return org;
        } catch (error) {
            logger?.hadError(error);
            throw error;
        } finally {
            logger?.end();
        }
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
     * @description Check if the current user can run the application
     * @returns {Promise<boolean>} true if this user can run the application. Never returns false (see exception)
     * @throws Exception if not enough permissions to run the application
     * @async
     * @public
     */
    public async checkCurrentUserPermissions(): Promise<boolean> {
        const logger = this._loggerFactory?.create('Check Current User Permissions', false);
        try {
            logger?.log(`Getting current user permissions...`);
            // Check if usage terms were accepted
            logger?.log(`Checking if usage terms were accepted...`);
            await this._throwExceptionIfUsageTermsNotAccepted();
            logger?.log(`Passed the terms checking.`);
            logger?.log(`Calling the prepare method for recipe: ${RecipeAliases.CURRENT_USER_PERMISSIONS}`);
            // @ts-expect-error: prepare() returns a broad union type, but CURRENT_USER_PERMISSIONS recipe always resolves to Map<string, boolean> at runtime
            const perms: Map = (await this._recipeManager.prepare(RecipeAliases.CURRENT_USER_PERMISSIONS, new Map([
                [OrgCheckGlobalParameter.SYSTEM_PERMISSIONS_LIST, [ 'ModifyAllData', 'AuthorApex', 'ApiEnabled', 'InstallPackaging' ]]
            ]), logger?.toSimpleLogger()));
            if (perms === undefined || 
                perms?.get('ModifyAllData') === false || perms?.get('AuthorApex')       === false ||
                perms?.get('ApiEnabled')    === false || perms?.get('InstallPackaging') === false) {
                    logger?.log(`Throwing exception because one of the required permissions is not assigned to the current user.`);
                    throw (new TypeError(
                        'Current User Permission Access is not enough to run the application. '+
                        'Please make sure to assign ALL the following permissions to the current user: '+
                        `Modify All Data, Author Apex, API Enabled and Download AppExchange Packages.`
                    ));
            }
            return true;
        } catch (error) {
            logger?.hadError(error);
            throw error;
        } finally {
            logger?.end();
        }
    }

    // -----------------------
    // ACTIONS
    // -----------------------

    /**
     * @description Send a request to run all tests in the org. When this method is finished, it does not mean all tests are run.
     * @returns {Promise<string>} The Salesforce Id of the AsyncApexJob
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    async runAllTestsAsync(): Promise<string> {
        const logger = this._loggerFactory?.create('Run All Tests', false);
        try {
            logger?.log(`Running all tests in the org...`);
            return await this._sfdcManager?.runAllTests(logger.toSimpleLogger());
        } catch (error) {
            logger?.hadError(error);
            throw error;
        } finally {
            logger?.end();
        }
    }

    /**
     * @description Compile the given list of Apex Classes and return the status of the compilation
     * @param {string[]} apexClassIds - the list of Apex Class Ids to compile
     * @returns {Promise<Map<string, { isSuccess: boolean, reasons?: string[]}>>} List of results by Apex Class ID
     * @async
     * @public
     */
    public async compileClasses(apexClassIds: string[]): Promise<Map<string, { isSuccess: boolean; reasons?: string[]; }>> {
        const logger = this._loggerFactory?.create('Compile Classes', false);
        try {
            return this._sfdcManager?.compileClasses(apexClassIds, logger.toSimpleLogger());
        } catch (error) {
            logger?.hadError(error);
            throw error;
        } finally {
            logger?.end();
        }
    }

    // -----------------------
    // USAGE TERMS ACCEPTANCE
    // -----------------------

    /**
     * @description Check if we can use the current org according to the terms (especially if this is a production org)
     * @returns {Promise<boolean>} true if this org can be used, false otherwise.
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async checkUsageTerms(): Promise<boolean> {
        const logger = this._loggerFactory?.create('Check Usage Terms', false);
        try {
            logger?.log(`Checking if usage terms were accepted...`);
            // @ts-expect-error: prepare() returns a broad union type, but ORGANIZATION recipe always resolves to SfdcOrganization at runtime
            const org: SfdcOrganization = (await this._recipeManager.prepare(RecipeAliases.ORGANIZATION, undefined, logger.toSimpleLogger()));
            logger?.log(`Organization info: ${org?.name}, isProduction: ${org?.isProduction}`);
            if (org?.isProduction === true && this._usageTermsAcceptedManually === false) {
                logger?.log(`Usage terms not yet accepted for this org.`);
                return false;
            }
            logger?.log(`Usage terms accepted for this org.`);
            return true;
        } catch (error) {
            logger?.hadError(error);
            throw error;
        } finally {
            logger?.end();
        }
    }

    /**
     * @description Returns if the usage terms were accepted manually
     * @returns {boolean} true if the usage terms were accepted manually, false otherwise
     * @public
     */
    public wereUsageTermsAcceptedManually(): boolean {
        const logger = this._loggerFactory?.create('Check If Usage Terms Were Accepted Manually', false);
        try {
            logger?.log(`Checking if usage terms were accepted manually...`);
            logger?.log(`Flag is currently set to: ${this._usageTermsAcceptedManually}`);
            return this._usageTermsAcceptedManually;
        } catch (error) {
            logger?.hadError(error);
            throw error;
        } finally {
            logger?.end();
        }
    }

    /**
     * @description Accept manually the usage terms
     * @public
     */
    public acceptUsageTermsManually() {
        const logger = this._loggerFactory?.create('Accept Usage Terms Manually', false);
        try {
            logger?.log(`Accepting usage terms manually...`);
            logger?.log(`Flag was previously set to: ${this._usageTermsAcceptedManually}`);
            this._usageTermsAcceptedManually = true;
            logger?.log(`Flag is now set to true.`);
        } catch (error) {
            logger?.hadError(error);
            throw error;
        } finally {
            logger?.end();
        }
    }

    // -----------------------
    // DATA FOR GLOBAL FILTER
    // -----------------------

    /**
     * @description Get information about the packages
     * @returns {Promise<SfdcPackage[]>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async getPackages(): Promise<SfdcPackage[]> {
        const logger = this._loggerFactory?.create('Get Packages', false);
        try {
            logger?.log(`Getting packages...`);
            // Check if usage terms were accepted
            logger?.log(`Checking if usage terms were accepted...`);
            await this._throwExceptionIfUsageTermsNotAccepted();
            logger?.log(`Passed the terms checking.`);
            logger?.log(`Calling the prepare method for recipe: ${RecipeAliases.PACKAGES}`);
            // @ts-expect-error: prepare() returns a broad union type, but PACKAGES recipe always resolves to the expected SfdcPackage data at runtime
            return await this._recipeManager.prepare(RecipeAliases.PACKAGES, undefined, logger?.toSimpleLogger());
        } catch (error) {
            logger?.hadError(error);
            throw error;
        } finally {
            logger?.end();
        }
    }

    /**
     * @description Get information about the object types
     * @returns {Promise<SfdcObjectType[]>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async getObjectTypes(): Promise<SfdcObjectType[]> {
        const logger = this._loggerFactory?.create('Get Object Types', false);
        try {
            logger?.log(`Getting object types...`);
            // Check if usage terms were accepted
            logger?.log(`Checking if usage terms were accepted...`);
            await this._throwExceptionIfUsageTermsNotAccepted();
            logger?.log(`Passed the terms checking.`);
            logger?.log(`Calling the prepare method for recipe: ${RecipeAliases.OBJECT_TYPES}`);
            // @ts-expect-error: prepare() returns a broad union type, but OBJECT_TYPES recipe always resolves to the expected SfdcObjectType data at runtime
            return await this._recipeManager.prepare(RecipeAliases.OBJECT_TYPES, undefined, logger?.toSimpleLogger());
        } catch (error) {
            logger?.hadError(error);
            throw error;
        } finally {
            logger?.end();
        }
    }

    /**
     * @description Get information about the objects 
     * @param {string} namespace - the namespace of the package to filter the objects
     * @param {string} sobjectType - the sobject type to filter the objects
     * @returns {Promise<SfdcObject[]>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async getObjects(namespace: string, sobjectType: string): Promise<SfdcObject[]> {
        const logger = this._loggerFactory?.create('Get Objects', false);
        try {
            logger?.log(`Getting objects...`);
            // Check if usage terms were accepted
            logger?.log(`Checking if usage terms were accepted...`);
            await this._throwExceptionIfUsageTermsNotAccepted();
            logger?.log(`Passed the terms checking.`);
            logger?.log(`Calling the prepare method for recipe: ${RecipeAliases.OBJECTS_LITE}`);
            // @ts-expect-error: prepare() returns a broad union type, but OBJECTS_LITE recipe always resolves to the expected SfdcObject data at runtime
            return await this._recipeManager.prepare(RecipeAliases.OBJECTS_LITE, new Map([
                [OrgCheckGlobalParameter.PACKAGE_NAME, namespace],
                [OrgCheckGlobalParameter.SOBJECT_TYPE_NAME, sobjectType],
            ]), logger?.toSimpleLogger());
        } catch (error) {
            logger?.hadError(error);
            throw error;
        } finally {
            logger?.end();
        }
    }

    /**
     * @description Remove all the cached information about objects
     * @public
     */
    public clearObjects() {
        const logger = this._loggerFactory?.create('Clear Objects from Cache', false);
        logger?.log(`Calling the clean method for recipe: ${RecipeAliases.OBJECTS_LITE}`);
        this._recipeManager.clean(RecipeAliases.OBJECTS_LITE);
    }

    /**
     * @description Remove all the cached information about packages
     * @public
     */
    public clearPackages() {
        const logger = this._loggerFactory?.create('Clear Packages from Cache', false);
        try {
            logger?.log(`Calling the clean method for recipe: ${RecipeAliases.PACKAGES}`);
            this._recipeManager.clean(RecipeAliases.PACKAGES);
            logger?.log(`Done.`);
        } catch (error) {
            logger?.hadError(error);
            throw error;
        } finally {
            logger?.end();
        }
    }

    /**
     * @description Get information about User Roles in a tree view
     * @returns {Promise<SfdcUserRole>} Tree
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async getRolesAsTree(): Promise<SfdcUserRole> {
        const logger = this._loggerFactory?.create('Get Roles as tree', false);
        try {
            logger?.log(`Getting roles...`);
            // Check if usage terms were accepted
            logger?.log(`Checking if usage terms were accepted...`);
            await this._throwExceptionIfUsageTermsNotAccepted();
            logger?.log(`Passed the terms checking.`);
            logger?.log(`Calling the prepare method for recipe: ${RecipeAliases.USER_ROLES}`);
            // @ts-expect-error: prepare() returns a broad union type, but USER_ROLES recipe always resolves to Map<string, SfdcUserRole> at runtime
            const allRoles: Map<string, SfdcUserRole> = (await this._recipeManager.prepare(RecipeAliases.USER_ROLES, undefined, logger?.toSimpleLogger()));
            // Key for artificial ROOT
            const ROOT_KEY = '__i am root__';
            // Create a map that stores all nodes with children references
            // Where:
            //   - key is the id of the node (string)
            //   - value is the node with properties: 
            //        * 'id' (mandatory string), 
            //        * 'children' (optional array), and,
            //        * 'record' (undefined for root, mandatory for other than root -- of type: SfdcUserRole)
            const allNodes = new Map();
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
            // Return the root node
            return allNodes.get(ROOT_KEY);
        } catch (error) {
            logger?.hadError(error);
            throw error;
        } finally {
            logger?.end();
        }
    }
    
    // -----------------------
    // GENERIC DATA RETRIEVER
    // -----------------------

    /**
     * @description Get a cachestamp for a specific data. A cachestamp is a string that represents the current state 
     *                  of the data in the org. It can be used to know if the data has changed since the last time it 
     *                  was retrieved.
     * @param {RecipeAliases} alias - name of the data you want to get
     * @param namespace 
     * @param sobjectType 
     * @param sobject 
     * @returns {string} cachestamp of the data
     * @public
     */
    public cachestampData(alias: RecipeAliases, namespace: string, sobjectType: string, sobject: string): string {
        const logger = this._loggerFactory?.create('Cache Stamp Data', false);
        try {
            logger?.log(`Calling the cachestamp method for recipe: ${alias} with namespace: ${namespace}, sobjectType: ${sobjectType} and sobject: ${sobject}`);
            const results = this._recipeManager.cachestamp(alias, new Map([
                [OrgCheckGlobalParameter.SOBJECT_NAME, sobject],
                [OrgCheckGlobalParameter.PACKAGE_NAME, namespace],
                [OrgCheckGlobalParameter.SOBJECT_TYPE_NAME, sobjectType]
            ]));
            logger?.log(`Done.`);
            return results;
        } catch (error) {
            logger?.hadError(error);
            throw error;
        } finally {
            logger?.end();
        }
    }

    /**
     * @description Prepare data for a specific recipe. This method will retrieve the data from the org, compute the 
     *                  score and return the data in a format that can be used by the UI.
     * @param {RecipeAliases} alias - name of the data you want to get
     * @param namespace 
     * @param sobjectType 
     * @param sobject 
     * @returns {Promise<DataWithScore | DataWithScore[] | DataMatrixIntf | Map<string, boolean> | DataCollectionStatisticsIntf[]>} data prepared for the UI
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async prepareData(alias: RecipeAliases, namespace: string, sobjectType: string, sobject: string): Promise<DataWithScore | DataWithScore[] | DataMatrixIntf | Map<string, boolean> | DataCollectionStatisticsIntf[]> {
        const logger = this._loggerFactory?.create(`Preparing data for recipe: ${alias}`, false);
        try {
            // Check if usage terms were accepted
            logger?.log(`Checking if usage terms were accepted...`);
            await this._throwExceptionIfUsageTermsNotAccepted();
            logger?.log(`Passed the terms checking.`);
            // Prepare the data
            logger?.log(`Using the following parameters: namespace: ${namespace}, sobjectType: ${sobjectType} and sobject: ${sobject}`);
            const results = await this._recipeManager.prepare(alias, new Map([
                [OrgCheckGlobalParameter.SOBJECT_NAME, sobject],
                [OrgCheckGlobalParameter.PACKAGE_NAME, namespace],
                [OrgCheckGlobalParameter.SOBJECT_TYPE_NAME, sobjectType]
            ]), logger?.toSimpleLogger());
            logger?.log(`Done.`);
            return results;
        } catch (error) {
            logger?.hadError(error);
            throw error;
        } finally {
            logger?.end();
        }
    }

    /**
     * @description Serve data for a specific recipe. This method will format the data in a way that can be used by the UI.
     * @param {RecipeAliases} alias - name of the data you want to get
     * @param {DataWithScore | DataWithScore[] | DataMatrixIntf | Map<string, boolean> | DataCollectionStatisticsIntf[]} mixture 
     * @returns {Promise<Table | SfdcObjectAsTable | GlobalViewAsTable | Table[]>} data formatted for the UI
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async serveData(alias: RecipeAliases, mixture: DataWithScore | DataWithScore[] | DataMatrixIntf | Map<string, boolean> | DataCollectionStatisticsIntf[]): Promise<Table | SfdcObjectAsTable | GlobalViewAsTable | Table[]> {
        const logger = this._loggerFactory?.create(`Serving data for recipe: ${alias}`, false);
        try {
            // Serve the data
            logger?.log(`Generating the table`);
            return await this._recipeManager.serveToTable(alias, mixture, logger?.toSimpleLogger());
        } catch (error) {
            logger?.hadError(error);
            throw error;
        } finally {
            logger?.end();
        }
    }

    /**
     * @description Export data for a specific recipe. This method will format the data in a way that can be used for export.
     * @param {RecipeAliases} alias - name of the data you want to get
     * @param {Table | SfdcObjectAsTable | GlobalViewAsTable | Table[]} plate 
     * @returns {Promise<ExportedTable | ExportedTable[]>} data formatted for export
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async exportData(alias: RecipeAliases, plate: Table | SfdcObjectAsTable | GlobalViewAsTable | Table[]): Promise<ExportedTable | ExportedTable[]> {
        const logger = this._loggerFactory?.create(`Exporting data for recipe: ${alias}`, false);
        try {
            // Export the data
            logger?.log(`Generating the exported table(s)`);
            return await this._recipeManager.serveToGo(alias, plate, logger?.toSimpleLogger());
        } catch (error) {
            logger?.hadError(error);
            throw error;
        } finally {
            logger?.end();
        }
    }

    /**
     * @description Get the titles for all available data
     * @returns {Map<RecipeAliases, string>} Map of data titles
     * @public
     */
    public titlesForAllData(): Map<RecipeAliases, string> {
        const logger = this._loggerFactory?.create('Get All Titles For Data', false);
        try {
            logger?.log(`Getting all titles for data...`);
            return this._recipeManager.listAllTitles();
        } catch (error) {
            logger?.hadError(error);
            throw error;
        } finally {
            logger?.end();
        }
    }

    /**
     * @description Remove all the cached information about a specific data
     * @param {RecipeAliases} alias - name of the data you want to get
     * @param namespace 
     * @param sobjectType 
     * @param sobject 
     * @public
     */
    public cleanData(alias: RecipeAliases, namespace: string, sobjectType: string, sobject: string): void {
        const logger = this._loggerFactory?.create(`Clean Data for recipe: ${alias}`, false);
        try {
            // Clean the data
            logger?.log(`Using the following parameters: namespace: ${namespace}, sobjectType: ${sobjectType} and sobject: ${sobject}`);
            const results = this._recipeManager.clean(alias, new Map([
                [OrgCheckGlobalParameter.SOBJECT_NAME, sobject],
                [OrgCheckGlobalParameter.PACKAGE_NAME, namespace],
                [OrgCheckGlobalParameter.SOBJECT_TYPE_NAME, sobjectType]
            ]));
            logger?.log(`Done.`);
            return results;
        } catch (error) {
            logger?.hadError(error);
            throw error;
        } finally {
            logger?.end();
        }
    }

    // -----------------------
    // PRIVATE INTERBAL METHODS
    // -----------------------

    /**
     * @description Internal method to check the acceptance of the terms before actually run any recipies
     * @throws Error if usage is not accepted
     */
    private async _throwExceptionIfUsageTermsNotAccepted() {
        if (await this.checkUsageTerms() === false) {
            throw new Error(`You must accept the usage terms before using Org Check in this environment.`);
        }
    }
}