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
    string;
    
    /** 
     * @description Use the tooling or not (false by default)
     * @type {boolean | undefined} [tooling=false]
     * @public
     * @readonly
     */
    tooling;
    
    /**
     * @description List of error codes to by-pass (empty by default)
     * @type {Array<string> | undefined} [byPasses]
     * @public
     * @readonly
     */
    byPasses;
    
    /** 
     * @description Unique field name to use for the custom QueryMore (Id by default)
     * @type {string | undefined} [queryMoreField]
     * @public
     * @readonly
     */
    queryMoreField;
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
    type;

    /**
     * @description Array of names of the metadata to read/retrieve
     * @type {Array<string>}
     * @public
     */ 
    members;
}

/** 
 * @description Salesforce APIs Manager Interface
 */
export class SalesforceManagerIntf {

    /**
     * @description Numerical representation of the Salesforce API used by the manager
     * @returns {number | undefined} API Version as a number
     * @public
     */
    get apiVersion() { throw new Error(`Method apiVersion() not implemented yet.`); }

    /**
     * @description Make sure the given Salesforce Id is an ID15
     * @param {string} id - Salesforce ID 15 or 18
     * @returns {string | undefined} Salesforce ID 15
     * @public
     */
    caseSafeId(id) { throw new Error(`Method caseSafeId(id=${id}) not implemented yet.`); }

    /**
     * @description Returns the setup URL if a given item
     * @param {string} id - Identification of the data to be used in the Setup URL. 
     * @param {string} type - Type of the data to be used to choose the correct URL template
     * @param {string} [parentId] - In case the template URL has a reference to the parent, this optional property will contain the parent identification.
     * @param {string} [parentType] - In case the template URL has a reference to the parent, this optional property will contain the parent type.
     * @returns {string | undefined} Setup URL for the given item
     * @public
     */
    setupUrl(id, type, parentId, parentType) { throw new Error(`Method setupUrl(id=${id}, type=${type}, parentId=${parentId}, parentType=${parentType}) not implemented yet.`); }

    /**
     * @description Returns the object type of a given sobject based on its API Name (ending with extension) and isCustomSetting flag
     * @param {string} apiName - API Name of the object
     * @param {boolean} isCustomSetting - true if the object is a custom setting
     * @returns {string | undefined} Object Type
     * @public
     */
    getObjectType(apiName, isCustomSetting) { throw new Error(`Method getObjectType(apiName=${apiName}, isCustomSetting=${isCustomSetting}) not implemented yet.`); }

    /**
     * @description Get the lastest Daily API Usage from JSForce, and the level of confidence we have in this ratio to continue using org check.
     * @returns {SalesforceUsageInformation | undefined} Information of the current usage of the Daily Request API
     * @public
     */
    get dailyApiRequestLimitInformation() { throw new Error(`Method dailyApiRequestLimitInformation() not implemented yet.`); } 

    /**
     * @description Method to call a list of SOQL queries (tooling or not)
     * @param {Array<SalesforceQueryRequest | any>} queries - Array of queries to be called
     * @param {SimpleLoggerIntf} logger - Logger to use
     * @returns {Promise<Array<Array<any>>>} Results of the called queries
     * @async
     * @public
     */
    async soqlQuery(queries, logger) { throw new Error(`Method soqlQuery(queries=${queries}, logger=${logger}) not implemented yet.`); }

    /**
     * @description Method to call a list of SOSL queries (tooling or not)
     * @param {Array<SalesforceQueryRequest | any>} queries - Array of queries to be called
     * @param {SimpleLoggerIntf} logger - Logger to use
     * @returns {Promise<Array<Array<any>>>} Results of the called queries
     * @async
     * @public
     */
    async soslQuery(queries, logger) { throw new Error(`Method soslQuery(queries=${queries}, logger=${logger}) not implemented yet.`); }

    /**
     * @param {Array<string>} ids - Array of Salesforce Ids
     * @param {SimpleLoggerIntf} logger - Logger to use
     * @returns {Promise<{ records: Array<any>, errors: Array<string> }>} Dependency data
     * @async
     * @public
     */
    async dependenciesQuery(ids, logger) { throw new Error(`Method dependenciesQuery(ids=${ids}, logger=${logger}) not implemented yet.`); }

    /**
     * @description Method to retrieve a list of metadata types
     * @param {Array<SalesforceMetadataRequest>} metadatas - Information of what metadata you want to retrieve
     * @param {SimpleLoggerIntf} logger - Logger to use
     * @returns {Promise<Map<string, Array<any>>>} Information by metadata type
     * @async
     * @public
     */
    async readMetadata(metadatas, logger) { throw new Error(`Method readMetadata(metadatas=${metadatas}, logger=${logger}) not implemented yet.`); }
    
    /**
     * @description Method to retrieve a list of metadata types by at Scale (using composite tooling api)
     * @param {string} type - Metadata type to retrieve
     * @param {any[]} ids - List of Ids to retrieve
     * @param {string[]} byPasses - Errors to bypass
     * @param {SimpleLoggerIntf} logger - Logger to use
     * @returns {Promise<Array<any>>} Information of the metadata type
     * @async
     * @public
     */
    async readMetadataAtScale(type, ids, byPasses, logger) { throw new Error(`Method readMetadataAtScale(type=${type}, ids=${ids}, byPasses=${byPasses}, logger=${logger}) not implemented yet.`); }
    
    /**
     * @description Method to get the list of sobjects
     * @param {SimpleLoggerIntf} logger - Logger to use
     * @returns {Promise<Array<any>>} Information of the objects
     * @async
     * @public
     */
    async describeGlobal(logger)  { throw new Error(`Method describeGlobal(logger=${logger}) not implemented yet.`); }

    /**
     * @description Method to describe one particular sobject
     * @param {string} sobjectDevName - Name of the sobject to describe
     * @param {SimpleLoggerIntf} logger - Logger to use
     * @returns {Promise<any>} Information of the sobject
     * @async
     * @public
     */
    async describe(sobjectDevName, logger)  { throw new Error(`Method describe(sobjectDevName=${sobjectDevName}, logger=${logger}) not implemented yet.`); }
    
    /**
     * @description Method to get the record count (recycle bin included) of one particular sobject
     * @param {string} sobjectDevName - Name of the sobject to describe
     * @param {SimpleLoggerIntf} logger - Logger to use
     * @returns {Promise<number>} Number of records
     * @async
     * @public
     */
    async recordCount(sobjectDevName, logger)  { throw new Error(`Method recordCount(sobjectDevName=${sobjectDevName}, logger=${logger}) not implemented yet.`); }   

    /**
     * @description Method to run all apex test in the org
     * @param {SimpleLoggerIntf} logger - Logger to use
     * @returns {Promise<string>} Result of the tests running from tooling api
     * @async
     * @public
     */
    async runAllTests(logger) { throw new Error(`Method runAllTests(logger=${logger}) not implemented yet.`); }

    /**
     * @description Method to run compile given apex classes
     * @param {Array<string>} apexClassIds - List of apex class ids to compile
     * @param {SimpleLoggerIntf} logger - Logger to use
     * @returns {Promise<Array<any>>} Result of the compilation from tooling api
     * @async
     * @public
     */
    async compileClasses(apexClassIds, logger) { throw new Error(`Method compileClasses(apexClassIds=${apexClassIds}, logger=${logger}) not implemented yet.`); }
}