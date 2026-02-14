import { SimpleLoggerIntf } from './orgcheck-api-logger';
import { SalesforceUsageInformation } from './orgcheck-api-salesforce-watchdog';

/**
 * @description Salesforce Query request
 */
export class SalesforceQueryRequest {

    /** 
     * @description SOQL query string
     * @type {string}
     * @public
     * @readonly
     */
    string: string;
    
    /** 
     * @description Use the tooling or not (false by default)
     * @type {boolean | undefined} [tooling=false]
     * @public
     * @readonly
     */
    tooling: boolean | undefined;
    
    /**
     * @description List of error codes to by-pass (empty by default)
     * @type {Array<string> | undefined} [byPasses]
     * @public
     * @readonly
     */
    byPasses: Array<string> | undefined;
    
    /** 
     * @description Unique field name to use for the custom QueryMore (Id by default)
     * @type {string | undefined} [queryMoreField]
     * @public
     * @readonly
     */
    queryMoreField: string | undefined;
}

/**
 * @description Salesforce Metadata API Request
 */ 
export class SalesforceMetadataRequest {
    
    /**
     * @description Type of the metadata to read/retrieve
     * @type {string}
     * @public
     */ 
    type: string;

    /**
     * @description Array of names of the metadata to read/retrieve
     * @type {Array<string>}
     * @public
     */ 
    members: Array<string>;
}

/**
 * @description Salesforce Error Information
 */
export class SalesforceError extends Error {

    /** 
     * @description Error code (should be capitalized by Salesforce)
     * @type {string}
     * @public
     * @readonly
     */
    code: string;

    /** 
     * @description Context information about the error, such as the query that caused the error, but not limited to it.
     * @type {any}
     * @public
     * @readonly
     */
    contextInformation: any;

    /**
     * @description Constructor for SalesforceError
     * @param {string} message - Context of this error
     * @param {string} code - Salesforce error code
     * @param {any} [contextInformation] - Json object with additional context information
     * @public
     */
    constructor(message: string, code: string, contextInformation: any) {
        super(message)
        this.code = code;
        this.contextInformation = contextInformation;
    }
}

/** 
 * @description Salesforce APIs Manager Interface
 */
export interface SalesforceManagerIntf {

    /**
     * @description Numerical representation of the Salesforce API used by the manager
     * @returns {number | undefined} API Version as a number
     * @public
     */
    get apiVersion(): number | undefined;

    /**
     * @description Make sure the given Salesforce Id is an ID15
     * @param {string} id - Salesforce ID 15 or 18
     * @returns {string | undefined} Salesforce ID 15
     * @public
     */
    caseSafeId(id: string): string | undefined;

    /**
     * @description Returns the setup URL if a given item
     * @param {string} id - Identification of the data to be used in the Setup URL. 
     * @param {string} type - Type of the data to be used to choose the correct URL template
     * @param {string} [parentId] - In case the template URL has a reference to the parent, this optional property will contain the parent identification.
     * @param {string} [parentType] - In case the template URL has a reference to the parent, this optional property will contain the parent type.
     * @returns {string | undefined} Setup URL for the given item
     * @public
     */
    setupUrl(id: string, type: string, parentId?: string, parentType?: string): string | undefined;

    /**
     * @description Returns the object type of a given sobject based on its API Name (ending with extension) and isCustomSetting flag
     * @param {string} apiName - API Name of the object
     * @param {boolean} isCustomSetting - true if the object is a custom setting
     * @returns {string | undefined} Object Type
     * @public
     */
    getObjectType(apiName: string, isCustomSetting: boolean): string | undefined;

    /**
     * @description Get the lastest Daily API Usage from JSForce, and the level of confidence we have in this ratio to continue using org check.
     * @returns {SalesforceUsageInformation | undefined} Information of the current usage of the Daily Request API
     * @public
     */
    get dailyApiRequestLimitInformation(): SalesforceUsageInformation | undefined;

    /**
     * @description Method to call a list of SOQL queries (tooling or not)
     * @param {Array<SalesforceQueryRequest | any>} queries - Array of queries to be called
     * @param {SimpleLoggerIntf} logger - Logger to use
     * @returns {Promise<Array<Array<any>>>} Results of the called queries
     * @throws {SalesforceError} If an error occurs during the query
     * @async
     * @public
     */
    soqlQuery(queries: Array<SalesforceQueryRequest | any>, logger: SimpleLoggerIntf): Promise<Array<Array<any>>>;

    /**
     * @description Method to call a list of SOSL queries (tooling or not)
     * @param {Array<SalesforceQueryRequest | any>} queries - Array of queries to be called
     * @param {SimpleLoggerIntf} logger - Logger to use
     * @returns {Promise<Array<Array<any>>>} Results of the called queries
     * @throws {SalesforceError} If an error occurs during the query
     * @async
     * @public
     */
    soslQuery(queries: Array<SalesforceQueryRequest | any>, logger: SimpleLoggerIntf): Promise<Array<Array<any>>>;

    /**
     * @param {Array<string>} ids - Array of Salesforce Ids
     * @param {SimpleLoggerIntf} logger - Logger to use
     * @returns {Promise<{ records: Array<any>, errors: Array<string> }>} Dependency data
     * @throws {SalesforceError} If an error occurs during the query
     * @async
     * @public
     */
    dependenciesQuery(ids: Array<string>, logger: SimpleLoggerIntf): Promise<{ records: Array<any>; errors: Array<string>; }>;

    /**
     * @description Method to retrieve a list of metadata types
     * @param {Array<SalesforceMetadataRequest>} metadatas - Information of what metadata you want to retrieve
     * @param {SimpleLoggerIntf} logger - Logger to use
     * @returns {Promise<Map<string, Array<any>>>} Information by metadata type
     * @throws {SalesforceError} If an error occurs during the query
     * @async
     * @public
     */
    readMetadata(metadatas: Array<SalesforceMetadataRequest>, logger: SimpleLoggerIntf): Promise<Map<string, Array<any>>>;
    
    /**
     * @description Method to retrieve a list of metadata types by at Scale (using composite tooling api)
     * @param {string} type - Metadata type to retrieve
     * @param {any[]} ids - List of Ids to retrieve
     * @param {string[]} byPasses - Errors to bypass
     * @param {SimpleLoggerIntf} logger - Logger to use
     * @returns {Promise<Array<any>>} Information of the metadata type
     * @throws {SalesforceError} If an error occurs during the query
     * @async
     * @public
     */
    readMetadataAtScale(type: string, ids: any[], byPasses: string[], logger: SimpleLoggerIntf): Promise<Array<any>>;
    
    /**
     * @description Method to get the list of sobjects
     * @param {SimpleLoggerIntf} logger - Logger to use
     * @returns {Promise<Array<any>>} Information of the objects
     * @throws {SalesforceError} If an error occurs during the query
     * @async
     * @public
     */
    describeGlobal(logger: SimpleLoggerIntf): Promise<Array<any>>;

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
     * @param {SimpleLoggerIntf} logger - Logger to use
     * @returns {Promise<string>} Result of the tests running from tooling api
     * @throws {SalesforceError} If an error occurs during the query
     * @async
     * @public
     */
    runAllTests(logger: SimpleLoggerIntf): Promise<string>;

    /**
     * @description Method to run compile given apex classes
     * @param {Array<string>} apexClassIds - List of apex class ids to compile
     * @param {SimpleLoggerIntf} [logger] - Logger to use
     * @returns {Promise<Map<string, { isSuccess: boolean, reasons?: Array<string>}>>} List of results by Apex Class ID
     * @throws {SalesforceError} If an error occurs during the query
     * @async
     * @public
     */
    compileClasses(apexClassIds: Array<string>, logger: SimpleLoggerIntf): Promise<Map<string, { isSuccess: boolean; reasons?: Array<string>; }>>;
}