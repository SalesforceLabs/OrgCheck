import { LoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { DataCacheManagerIntf } from 'src/api/core/cache/orgcheck-api-cachemanager';
import { DataCacheManager } from 'src/api/core/cache/orgcheck-api-cachemanager-impl';
import { DatasetManager } from 'src/api/core/dataset/orgcheck-api-datasetmanager-impl';
import { DatasetManagerIntf } from 'src/api/core/dataset/orgcheck-api-datasetmanager';
import { Logger } from 'src/api/core/logger/orgcheck-api-logger-impl';
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
import { Data, DataMatrixIntf } from 'src/orgcheck';
import { DataCollectionStatisticsIntf } from 'src/api/core/data/orgcheck-api-data-datacollectionstats';
import { Table } from 'src/ui/table/orgcheck-ui-table';
import { CacheItem } from 'src/api/data/orgcheck-api-data-cacheitem';
import { LoggerUtil } from './core/logger/orgcheck-api-loggerutil';

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
    public readonly orgId: string;

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
     * @description Private Logger property used to send log information to the UI (if any)
     * @type {LoggerIntf}
     * @private
     */
    private readonly _logger: LoggerIntf;

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
        this.orgId = this._sfdcManager.orgId;

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
    public getCacheItem(itemName: string): any {
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
        const log = this._logger?.toSimpleLogger('Get Organization Information');
        try {
            if (log?.isDebugEnabled()) log?.debug(`Calling the prepare method for recipe: ${RecipeAliases.ORGANIZATION}`);
            // @ts-ignore
            return (await this._recipeManager.prepare(RecipeAliases.ORGANIZATION));
        } catch (error) {
            if (log?.isDebugEnabled()) log?.debug(`Error occurred: message: ${error.message}, stack: ${error.stack}`);
            throw error;
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
        const log = this._logger?.toSimpleLogger('Check Current User Permissions');
        try {
            if (log?.isDebugEnabled()) log?.debug('Getting current user permissions...');
            // Check if usage terms were accepted
            if (log?.isDebugEnabled()) log?.debug('Checking if usage terms were accepted...');
            await this._throwExceptionIfUsageTermsNotAccepted();
            if (log?.isDebugEnabled()) log?.debug('Passed the terms checking!');
            if (log?.isDebugEnabled()) log?.debug(`Calling the prepare method for recipe: ${RecipeAliases.CURRENT_USER_PERMISSIONS}`);
            // @ts-ignore
            const perms: Map = (await this._recipeManager.prepare(RecipeAliases.CURRENT_USER_PERMISSIONS, new Map([
                [OrgCheckGlobalParameter.SYSTEM_PERMISSIONS_LIST, [ 'ModifyAllData', 'AuthorApex', 'ApiEnabled', 'InstallPackaging' ]]
            ])));
            if (perms === undefined || 
                perms?.get('ModifyAllData') === false || perms?.get('AuthorApex')       === false ||
                perms?.get('ApiEnabled')    === false || perms?.get('InstallPackaging') === false) {
                    if (log?.isDebugEnabled()) log?.debug('Throw exception because one of the required permissions is not assigned to the current user');
                    throw (new TypeError(
                        'Current User Permission Access is not enough to run the application. '+
                        'Please make sure to assign ALL the following permissions to the current user: '+
                        `Modify All Data, Author Apex, API Enabled and Download AppExchange Packages.`
                    ));
            }
            if (log?.isDebugEnabled()) log?.debug('returning TRUE');
            return true;
        } catch (error) {
            if (log?.isDebugEnabled()) log?.debug(`Error occurred: message: ${error.message}, stack: ${error.stack}`);
            throw error;
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
        const log = this._logger?.toSimpleLogger('Run All Tests');
        try {
            if (log?.isDebugEnabled()) log?.debug('Running all tests in the org...');
            return this._sfdcManager?.runAllTests(log);
        } catch (error) {
            if (log?.isDebugEnabled()) log?.debug(`Error occurred: message: ${error.message}, stack: ${error.stack}`);
            throw error;
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
        const log = this._logger?.toSimpleLogger('Compile Classes');
        try {
            return this._sfdcManager?.compileClasses(apexClassIds, log);
        } catch (error) {
            if (log?.isDebugEnabled()) log?.debug(`Error occurred: message: ${error.message}, stack: ${error.stack}`);
            throw error;
        }
    }

    // -----------------------
    // USAGE TERMS ACCEPTANCE
    // -----------------------

    /**
     * @description Check if we can use the current org according to the terms (specially if this is a production org)
     * @returns {Promise<boolean>} true if this org can be used, false otehrwise.
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    public async checkUsageTerms(): Promise<boolean> {
        const log = this._logger?.toSimpleLogger('Check Usage Terms');
        try {
            if (log?.isDebugEnabled()) log?.debug('Checking usage terms acceptance...');
            const orgInfo = (await this.getOrganizationInformation());
            if (log?.isDebugEnabled()) log?.debug(`Organization info: ${orgInfo.name}, isProduction: ${orgInfo.isProduction}`);
            if (orgInfo.isProduction === true && this._usageTermsAcceptedManually === false) {
                if (log?.isDebugEnabled()) log?.debug('Usage terms not yet accepted for this org');
                return false;
            }
            if (log?.isDebugEnabled()) log?.debug('Usage terms accepted for this org');
            return true;
        } catch (error) {
            if (log?.isDebugEnabled()) log?.debug(`Error occurred: message: ${error.message}, stack: ${error.stack}`);
            throw error;
        }
    }

    /**
     * @description Returns if the usage terms were accepted manually
     * @returns {boolean} true if the usage terms were accepted manually, false otherwise
     * @public
     */
    public wereUsageTermsAcceptedManually(): boolean {
        const log = this._logger?.toSimpleLogger('Check If Usage Terms Were Accepted Manually');
        try {
            if (log?.isDebugEnabled()) log?.debug('Checking if usage terms were accepted manually...');
            if (log?.isDebugEnabled()) log?.debug(`Flag is currently set to: ${this._usageTermsAcceptedManually}`);
            return this._usageTermsAcceptedManually;
        } catch (error) {
            if (log?.isDebugEnabled()) log?.debug(`Error occurred: message: ${error.message}, stack: ${error.stack}`);
            throw error;
        }
    }

    /**
     * @description Accept manually the usage terms
     * @public
     */
    public acceptUsageTermsManually() {
        const log = this._logger?.toSimpleLogger('Accept Usage Terms Manually');
        try {
            if (log?.isDebugEnabled()) log?.debug('Accepting usage terms manually...');
            if (log?.isDebugEnabled()) log?.debug(`Flag was previously set to: ${this._usageTermsAcceptedManually}`);
            this._usageTermsAcceptedManually = true;
            if (log?.isDebugEnabled()) log?.debug('Now set to true');
        } catch (error) {
            if (log?.isDebugEnabled()) log?.debug(`Error occurred: message: ${error.message}, stack: ${error.stack}`);
            throw error;
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
        const log = this._logger?.toSimpleLogger('Get Packages');
        try {
            if (log?.isDebugEnabled()) log?.debug('Getting packages...');
            // Check if usage terms were accepted
            if (log?.isDebugEnabled()) log?.debug('Checking if usage terms were accepted...');
            await this._throwExceptionIfUsageTermsNotAccepted();
            if (log?.isDebugEnabled()) log?.debug('Passed the terms checking!');
            if (log?.isDebugEnabled()) log?.debug(`Calling the prepare method for recipe: ${RecipeAliases.PACKAGES}`);
            // @ts-ignore
            return (await this._recipeManager.prepare(RecipeAliases.PACKAGES));
        } catch (error) {
            if (log?.isDebugEnabled()) log?.debug(`Error occurred: message: ${error.message}, stack: ${error.stack}`);
            throw error;
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
        const log = this._logger?.toSimpleLogger('Get Object Types');
        try {
            if (log?.isDebugEnabled()) log?.debug('Getting Object Types...');
            // Check if usage terms were accepted
            if (log?.isDebugEnabled()) log?.debug('Checking if usage terms were accepted...');
            await this._throwExceptionIfUsageTermsNotAccepted();
            if (log?.isDebugEnabled()) log?.debug('Passed the terms checking!');
            if (log?.isDebugEnabled()) log?.debug(`Calling the prepare method for recipe: ${RecipeAliases.OBJECT_TYPES}`);
            // @ts-ignore
            return (await this._recipeManager.prepare(RecipeAliases.OBJECT_TYPES));
        } catch (error) {
            if (log?.isDebugEnabled()) log?.debug(`Error occurred: message: ${error.message}, stack: ${error.stack}`);
            throw error;
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
        const log = this._logger?.toSimpleLogger('Get Objects');
        try {
            if (log?.isDebugEnabled()) log?.debug('Getting objects...');
            // Check if usage terms were accepted
            if (log?.isDebugEnabled()) log?.debug('Checking if usage terms were accepted...');
            await this._throwExceptionIfUsageTermsNotAccepted();
            if (log?.isDebugEnabled()) log?.debug('Passed the terms checking!');
            if (log?.isDebugEnabled()) log?.debug(`Calling the prepare method for recipe: ${RecipeAliases.OBJECTS}`);
            // @ts-ignore
            return (await this._recipeManager.prepare(RecipeAliases.OBJECTS, new Map([
                [OrgCheckGlobalParameter.PACKAGE_NAME, namespace],
                [OrgCheckGlobalParameter.SOBJECT_TYPE_NAME, sobjectType],
            ])));
        } catch (error) {
            if (log?.isDebugEnabled()) log?.debug(`Error occurred: message: ${error.message}, stack: ${error.stack}`);
            throw error;
        }
    }

    /**
     * @description Remove all the cached information about objects
     * @public
     */
    public clearObjects() {
        const log = this._logger?.toSimpleLogger('Clear Objects from Cache');
        if (log?.isDebugEnabled()) log?.debug(`Calling the clean method for recipe: ${RecipeAliases.OBJECTS}`);
        this._recipeManager.clean(RecipeAliases.OBJECTS);
    }

    /**
     * @description Remove all the cached information about packages
     * @public
     */
    public clearPackages() {
        const log = this._logger?.toSimpleLogger('Clear Packages from Cache');
        try {
            if (log?.isDebugEnabled()) log?.debug(`Calling the clean method for recipe: ${RecipeAliases.PACKAGES}`);
            this._recipeManager.clean(RecipeAliases.PACKAGES);
        } catch (error) {
            if (log?.isDebugEnabled()) log?.debug(`Error occurred: message: ${error.message}, stack: ${error.stack}`);
            throw error;
        }
    }
    
    // -----------------------
    // GENERIC DATA RETRIEVER
    // -----------------------

    public cachestampData(alias: RecipeAliases, namespace: string, sobjectType: string, sobject: string): string {
        const log = this._logger?.toSimpleLogger('Cache Stamp Data');
        try {
            if (log?.isDebugEnabled()) log?.debug(`Calling the cachestamp method for recipe: ${alias} with namespace: ${namespace}, sobjectType: ${sobjectType} and sobject: ${sobject}`);
            return this._recipeManager.cachestamp(alias, new Map([
                [OrgCheckGlobalParameter.SOBJECT_NAME, sobject],
                [OrgCheckGlobalParameter.PACKAGE_NAME, namespace],
                [OrgCheckGlobalParameter.SOBJECT_TYPE_NAME, sobjectType]
            ]));
        } catch (error) {
            if (log?.isDebugEnabled()) log?.debug(`Error occurred: message: ${error.message}, stack: ${error.stack}`);
            throw error;
        }
    }

    public async prepareData(alias: RecipeAliases, namespace: string, sobjectType: string, sobject: string): Promise<Data | Data[] | DataMatrixIntf | Map<string, boolean> | DataCollectionStatisticsIntf[]> {
        const log = this._logger?.toSimpleLogger('Prepare Data');
        try {
            // Check if usage terms were accepted
            if (log?.isDebugEnabled()) log?.debug('Checking if usage terms were accepted...');
            await this._throwExceptionIfUsageTermsNotAccepted();
            if (log?.isDebugEnabled()) log?.debug('Passed the terms checking!');
            // Prepare the data
            if (log?.isDebugEnabled()) log?.debug(`Calling the prepare method for recipe: ${alias} with namespace: ${namespace}, sobjectType: ${sobjectType} and sobject: ${sobject}`);
            return await this._recipeManager.prepare(alias, new Map([
                [OrgCheckGlobalParameter.SOBJECT_NAME, sobject],
                [OrgCheckGlobalParameter.PACKAGE_NAME, namespace],
                [OrgCheckGlobalParameter.SOBJECT_TYPE_NAME, sobjectType]
            ]));
        } catch (error) {
            if (log?.isDebugEnabled()) log?.debug(`Error occurred: message: ${error.message}, stack: ${error.stack}`);
            throw error;
        }
    }

    public async serveData(alias: RecipeAliases, mixture: Data | Data[] | DataMatrixIntf | Map<string, boolean> | DataCollectionStatisticsIntf[]): Promise<Table | SfdcObjectAsTable | Table[]> {
        const log = this._logger?.toSimpleLogger('Serve Data');
        try {
            // Check if usage terms were accepted
            if (log?.isDebugEnabled()) log?.debug('Checking if usage terms were accepted...');
            await this._throwExceptionIfUsageTermsNotAccepted();
            if (log?.isDebugEnabled()) log?.debug('Passed the terms checking!');
            // Serve the data
            if (log?.isDebugEnabled()) log?.debug(`Calling the serveToTable method for recipe: ${alias} with mixture: ${LoggerUtil.JSONstringifyWithoutRef(mixture)}`);
            return await this._recipeManager.serveToTable(alias, mixture);
        } catch (error) {
            if (log?.isDebugEnabled()) log?.debug(`Error occurred: message: ${error.message}, stack: ${error.stack}`);
            throw error;
        }
    }

    public titlesForAllData(): Map<RecipeAliases, string> {
        const log = this._logger?.toSimpleLogger('Get All Titles For Data');
        try {
            if (log?.isDebugEnabled()) log?.debug('Getting all titles for data...');
            return this._recipeManager.listAllTitles();
        } catch (error) {
            if (log?.isDebugEnabled()) log?.debug(`Error occurred: message: ${error.message}, stack: ${error.stack}`);
            throw error;
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
    cleanData(alias: RecipeAliases, namespace: string, sobjectType: string, sobject: string): void {
        const log = this._logger?.toSimpleLogger('Clean Data');
        try {
            // Clean the data
            if (log?.isDebugEnabled()) log?.debug(`Calling the clean method for recipe: ${alias} with namespace: ${namespace}, sobjectType: ${sobjectType} and sobject: ${sobject}`);
            this._recipeManager.clean(alias, new Map([
                [OrgCheckGlobalParameter.SOBJECT_NAME, sobject],
                [OrgCheckGlobalParameter.PACKAGE_NAME, namespace],
                [OrgCheckGlobalParameter.SOBJECT_TYPE_NAME, sobjectType]
            ]));
        } catch (error) {
            if (log?.isDebugEnabled()) log?.debug(`Error occurred: message: ${error.message}, stack: ${error.stack}`);
            throw error;
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