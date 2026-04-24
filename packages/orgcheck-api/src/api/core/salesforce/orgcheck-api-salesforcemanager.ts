import { SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { SalesforceUsageInformationIntf } from 'src/api/core/salesforce/orgcheck-api-limit-usageinformation';

/**
 * @description Salesforce Query request
 */
export interface SalesforceQueryRequest {

    /** 
     * @description SOQL query string
     * @type {string}
     * @public
     * @readonly
     */
    string: string;
    
    /** 
     * @description Use the tooling or not (false by default)
     * @type {boolean} [tooling]
     * @public
     * @readonly
     */
    tooling?: boolean;
    
    /**
     * @description List of error codes to by-pass (empty by default)
     * @type {string[]} [byPasses]
     * @public
     * @readonly
     */
    byPasses?: string[];
    
    /** 
     * @description Unique field name to use for the custom QueryMore (Id by default)
     * @type {string} [queryMoreField]
     * @public
     * @readonly
     */
    queryMoreField?: string;
}

/**
 * @description Salesforce Metadata API Request
 */ 
export interface SalesforceMetadataRequest {
    
    /**
     * @description Type of the metadata to read/retrieve
     * @type {string}
     * @public
     */ 
    type: string;

    /**
     * @description Array of names of the metadata to read/retrieve
     * @type {string[]}
     * @public
     */ 
    members: string[];
}

/**
 * @description Salesforce Error Information
 */
export class SalesforceError extends Error {

    /**
     * @description Constructor for SalesforceError
     * @param {string} message - Context of this error
     * @param {string} code - Salesforce error code
     * @param {any} [contextInformation] - Json object with additional context information
     * @public
     */
    constructor(message: string, public readonly code: string, public readonly contextInformation: any) {
        super(message)
    }
}

/** 
 * @description Salesforce APIs Manager Interface
 */
export interface SalesforceManagerIntf {

    /**
     * @description Numerical representation of the Salesforce API used by the manager
     * @returns {number} API Version as a number
     * @public
     */
    apiVersion: number;

    /**
     * @description Make sure the given Salesforce Id is an ID15
     * @param {string} id - Salesforce ID 15 or 18
     * @returns {string} Salesforce ID 15
     * @public
     */
    caseSafeId(id: string): string;

    /**
     * @description Returns the setup URL if a given item
     * @param {string} id - Identification of the data to be used in the Setup URL. 
     * @param {string} type - Type of the data to be used to choose the correct URL template
     * @param {string} [parentId] - In case the template URL has a reference to the parent, this optional property will contain the parent identification.
     * @param {string} [parentType] - In case the template URL has a reference to the parent, this optional property will contain the parent type.
     * @returns {string} Setup URL for the given item
     * @public
     */
    setupUrl(id: string, type: string, parentId?: string, parentType?: string): string;

    /**
     * @description Returns the object type of a given sobject based on its API Name (ending with extension) and isCustomSetting flag
     * @param {string} apiName - API Name of the object
     * @param {boolean} isCustomSetting - true if the object is a custom setting
     * @returns {string} Object Type
     * @public
     */
    getObjectType(apiName: string, isCustomSetting: boolean): string;

    /**
     * @description Get the lastest Daily API Usage from JSForce, and the level of confidence we have in this ratio to continue using org check.
     * @returns {SalesforceUsageInformationIntf} Information of the current usage of the Daily Request API
     * @public
     */
    dailyApiRequestLimitInformation: SalesforceUsageInformationIntf;

    /**
     * @description Method to call a list of SOQL queries (tooling or not)
     * @param {SalesforceQueryRequest | any[]} queries - Array of queries to be called
     * @param {SimpleLoggerIntf} logger - Logger to use
     * @returns {Promise<Array<any[]>} Results of the called queries
     * @throws {SalesforceError} If an error occurs during the query
     * @async
     * @public
     */
    soqlQuery(queries: SalesforceQueryRequest | any[], logger: SimpleLoggerIntf): Promise<any[][]>;

    /**
     * @description Method to call a list of SOSL queries (tooling or not)
     * @param {SalesforceQueryRequest | any[]} queries - Array of queries to be called
     * @param {SimpleLoggerIntf} logger - Logger to use
     * @returns {Promise<Array<any[]>>} Results of the called queries
     * @throws {SalesforceError} If an error occurs during the query
     * @async
     * @public
     */
    soslQuery(queries: SalesforceQueryRequest | any[], logger: SimpleLoggerIntf): Promise<any[][]>;

    /**
     * @param {string[]} ids - Array of Salesforce Ids
     * @param {SimpleLoggerIntf} logger - Logger to use
     * @returns {Promise<{ records: any[], errors: string[] }>} Dependency data
     * @throws {SalesforceError} If an error occurs during the query
     * @async
     * @public
     */
    dependenciesQuery(ids: string[], logger: SimpleLoggerIntf): Promise<{ records: any[]; errors: string[]; }>;

    /**
     * @description Method to retrieve a list of metadata types
     * @param {SalesforceMetadataRequest[]} metadatas - Information of what metadata you want to retrieve
     * @param {SimpleLoggerIntf} logger - Logger to use
     * @returns {Promise<Map<string, any[]>} Information by metadata type
     * @throws {SalesforceError} If an error occurs during the query
     * @async
     * @public
     */
    readMetadata(metadatas: SalesforceMetadataRequest[], logger: SimpleLoggerIntf): Promise<Map<string, Array<any>>>;
    
    /**
     * @description Method to retrieve a list of metadata types by at Scale (using composite tooling api)
     * @param {string} type - Metadata type to retrieve
     * @param {any[]} ids - List of Ids to retrieve
     * @param {string[]} byPasses - Errors to bypass
     * @param {SimpleLoggerIntf} logger - Logger to use
     * @returns {Promise<any[]>} Information of the metadata type
     * @throws {SalesforceError} If an error occurs during the query
     * @async
     * @public
     */
    readMetadataAtScale(type: string, ids: any[], byPasses: string[], logger: SimpleLoggerIntf): Promise<any[]>;
    
    /**
     * @description Method to get the list of sobjects
     * @param {SimpleLoggerIntf} logger - Logger to use
     * @returns {Promise<any[]>} Information of the objects
     * @throws {SalesforceError} If an error occurs during the query
     * @async
     * @public
     */
    describeGlobal(logger: SimpleLoggerIntf): Promise<any[]>;

    /**
     * @description Method to describe one particular sobject
     * @param {string} sobjectDevName - Name of the sobject to describe
     * @param {SimpleLoggerIntf} logger - Logger to use
     * @returns {Promise<any>} Information of the sobject
     * @throws {SalesforceError} If an error occurs during the query
     * @async
     * @public
     */
    describe(sobjectDevName: string, logger: SimpleLoggerIntf): Promise<any>;
    
    /**
     * @description Method to get the record count (recycle bin included) of one particular sobject
     * @param {string} sobjectDevName - Name of the sobject to describe
     * @param {SimpleLoggerIntf} logger - Logger to use
     * @returns {Promise<number>} Number of records
     * @throws {SalesforceError} If an error occurs during the query
     * @async
     * @public
     */
    recordCount(sobjectDevName: string, logger: SimpleLoggerIntf): Promise<number>;

    /**
     * @description Method to run all apex test in the org
     * @param {SimpleLoggerIntf | undefined} logger - Logger to use
     * @returns {Promise<string>} Result of the tests running from tooling api
     * @throws {SalesforceError} If an error occurs during the query
     * @async
     * @public
     */
    runAllTests(logger?: SimpleLoggerIntf | undefined): Promise<string>;

    /**
     * @description Method to run compile given apex classes
     * @param {string[]} apexClassIds - List of apex class ids to compile
     * @param {SimpleLoggerIntf | undefined} [logger] - Logger to use
     * @returns {Promise<Map<string, { isSuccess: boolean, reasons?: string[]}>} List of results by Apex Class ID
     * @throws {SalesforceError} If an error occurs during the query
     * @async
     * @public
     */
    compileClasses(apexClassIds: string[], logger?: SimpleLoggerIntf | undefined): Promise<Map<string, { isSuccess: boolean; reasons?: string[]; }>>;
}