import { SalesforceUsageInformationIntf } from 'src/api/core/salesforce/orgcheck-api-limit-usageinformation';
import { LoggerSetup } from 'src/api/core/setup/orgcheck-api-setup-logger';
import { SalesforceManagerSetup } from 'src/api/core/setup/orgcheck-api-setup-salesforcemanager';
import { StorageSetup } from 'src/api/core/setup/orgcheck-api-setup-storage';
import { SfdcObject } from 'src/api/data/orgcheck-api-data-object';
import { SfdcObjectType } from 'src/api/data/orgcheck-api-data-objecttype';
import { SfdcOrganization } from 'src/api/data/orgcheck-api-data-organization';
import { SfdcPackage } from 'src/api/data/orgcheck-api-data-package';
import { CacheItem } from 'src/api/data/orgcheck-api-data-cacheitem';
import { SfdcObjectAsTable } from 'src/api/recipe/orgcheck-api-recipe-object';
import { RecipeAliases } from 'src/api/core/recipe/orgcheck-api-recipes-aliases';
import { Data } from 'src/api/core/data/orgcheck-api-data';
import { DataCollectionStatisticsIntf } from 'src/api/core/data/orgcheck-api-data-datacollectionstats';
import { DataMatrixIntf } from 'src/api/core/data/orgcheck-api-data-matrix';
import { ExportedTable, Table } from 'src/ui/table/orgcheck-ui-table';
import { SfdcUserRole } from 'src/orgcheck';

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
    orgId?: string;

    // -----------------------
    // CACHE
    // -----------------------

    /**
     * @description Remove all cache from dataset manager
     * @public
     */
    clearCache(): void;

    /**
     * @description List all the items in the cache manager
     * @returns {CacheItem[]} list of cache information 
     * @public
     */
    listCacheItems(): CacheItem[];

    /**
     * @description Get cache item from cache manager
     * @param {string} itemName - the name of the cache item to get
     * @returns {any} cached item 
     * @public
     */
    getCacheItem(itemName: string): any;

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
    getOrganizationInformation(): Promise<SfdcOrganization>;

    /**
     * @description Get the lastest Daily API Usage from JSForce, and the level of confidence we have in this ratio to continue using org check.
     * @returns {SalesforceUsageInformationIntf} Percentage of the daily api usage and a confidence precentage.
     * @public
     */
    dailyApiRequestLimitInformation: SalesforceUsageInformationIntf;

    /**
     * @description Check if the current user can run the application
     * @returns {Promise<boolean>} true if this user can run the application. Never returns false (see exception)
     * @throws Exception if not enough permissions to run the application
     * @async
     * @public
     */
    checkCurrentUserPermissions(): Promise<boolean>;

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
    runAllTestsAsync(): Promise<string>;

    /**
     * @description Compile the given list of Apex Classes and return the status of the compilation
     * @param {string[]} apexClassIds - the list of Apex Class Ids to compile
     * @returns {Promise<Map<string, { isSuccess: boolean, reasons?: string[]}>>} List of results by Apex Class ID
     * @async
     * @public
     */
    compileClasses(apexClassIds: string[]): Promise<Map<string, { isSuccess: boolean; reasons?: string[]; }>>;

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
    getPackages(): Promise<SfdcPackage[]>;

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
    clearObjects(): void;

    /**
     * @description Remove all the cached information about packages
     * @public
     */
    clearPackages(): void;

    /**
     * @description Get information about User Roles in a tree view
     * @returns {Promise<SfdcUserRole>} Tree
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getRolesAsTree(): Promise<SfdcUserRole>;

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
    cachestampData(alias: RecipeAliases, namespace: string, sobjectType: string, sobject: string): string;

    /**
     * @description Prepare data for a specific recipe. This method will retrieve the data from the org, compute the 
     *                  score and return the data in a format that can be used by the UI.
     * @param {RecipeAliases} alias - name of the data you want to get
     * @param namespace 
     * @param sobjectType 
     * @param sobject 
     * @returns {Promise<Data | Data[] | DataMatrixIntf | Map<string, boolean> | DataCollectionStatisticsIntf[]>} data prepared for the UI
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    prepareData(alias: RecipeAliases, namespace: string, sobjectType: string, sobject: string): Promise<Data | Data[] | DataMatrixIntf | Map<string, boolean> | DataCollectionStatisticsIntf[]>;

    /**
     * @description Serve data for a specific recipe. This method will format the data in a way that can be used by the UI.
     * @param {RecipeAliases} alias - name of the data you want to get
     * @param mixture 
     * @returns {Promise<Table | SfdcObjectAsTable | Table[]>} data formatted for the UI
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    serveData(alias: RecipeAliases, mixture: Data | Data[] | DataMatrixIntf | Map<string, boolean> | DataCollectionStatisticsIntf[]): Promise<Table | SfdcObjectAsTable | Table[]>;
    
    /**
     * @description Export data for a specific recipe. This method will format the data in a way that can be used for export.
     * @param {RecipeAliases} alias - name of the data you want to get
     * @param plate 
     * @returns {Promise<ExportedTable | ExportedTable[]>} data formatted for export
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    exportData(alias: RecipeAliases, plate: Table | SfdcObjectAsTable | Table[]): Promise<ExportedTable | ExportedTable[]>;

    /**
     * @description Get the titles for all available data
     * @returns {Map<RecipeAliases, string>} Map of data titles
     * @public
     */
    titlesForAllData(): Map<RecipeAliases, string>;

    /**
     * @description Remove all the cached information about a specific data
     * @param {RecipeAliases} alias - name of the data you want to get
     * @param namespace 
     * @param sobjectType 
     * @param sobject 
     * @public
     */
    cleanData(alias: RecipeAliases, namespace: string, sobjectType: string, sobject: string): void;
}