import { SimpleLoggerIntf } from './orgcheck-api-logger';
import { SalesforceUsageInformation } from './orgcheck-api-salesforce-watchdog';
import { SFDC_ApexClass } from '../data/orgcheck-api-data-apexclass';

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
     * @returns {number}
     * @public
     */
    get apiVersion() { throw new Error('Not implemented'); }

    /**
     * @description Make sure the given Salesforce Id is an ID15
     * @param {string} id 
     * @returns {string}
     * @public
     */
    caseSafeId(id) { throw new Error('Not implemented'); }

    /**
     * @description Returns the setup URL if a given item
     * @param {string} id Identification of the data to be used in the Setup URL. 
     * @param {string} type Type of the data to be used to choose the correct URL template
     * @param {string} [parentId] In case the template URL has a reference to the parent, this optional property will contain the parent identification.
     * @param {string} [parentType] In case the template URL has a reference to the parent, this optional property will contain the parent type.
     * @returns {string} 
     * @public
     */
    setupUrl(id, type, parentId, parentType) { throw new Error('Not implemented'); }

    /**
     * @description Returns the object type of a given sobject based on its API Name (ending with extension) and isCustomSetting flag
     * @param {string} apiName 
     * @param {boolean} isCustomSetting 
     * @returns {string}
     * @public
     */
    getObjectType(apiName, isCustomSetting) { throw new Error('Not implemented'); }

    /**
     * @description Get the lastest Daily API Usage from JSForce, and the level of confidence we have in this ratio to continue using org check.
     * @returns {SalesforceUsageInformation} Information of the current usage of the Daily Request API
     * @public
     */
    get dailyApiRequestLimitInformation() { throw new Error('Not implemented'); } 

    /**
     * @description Method to call a list of SOQL queries (tooling or not)
     * @param {Array<SalesforceQueryRequest | any>} queries 
     * @param {SimpleLoggerIntf} logger
     * @async
     * @returns {Promise<Array<Array<any>>>}
     * @public
     */
    async soqlQuery(queries, logger) { throw new Error('Not implemented'); }

    /**
     * @description Method to call a list of SOSL queries (tooling or not)
     * @param {Array<SalesforceQueryRequest | any>} queries 
     * @param {SimpleLoggerIntf} logger
     * @async
     * @returns {Promise<Array<Array<any>>>}
     * @public
     */
    async soslQuery(queries, logger) { throw new Error('Not implemented'); }

    /**
     * @param {Array<string>} ids
     * @param {SimpleLoggerIntf} logger
     * @async
     * @returns {Promise<{ records: Array<any>, errors: Array<string> }>}
     * @public
     */
    async dependenciesQuery(ids, logger) { throw new Error('Not implemented'); }

    /**
     * @description Method to retrieve a list of metadata types
     * @param {Array<SalesforceMetadataRequest>} metadatas 
     * @param {SimpleLoggerIntf} logger
     * @async
     * @returns {Promise<Map<string, Array<any>>>}
     * @public
     */
    async readMetadata(metadatas, logger) { throw new Error('Not implemented'); }
    
    /**
     * @description Method to retrieve a list of metadata types by at Scale (using composite tooling api)
     * @param {SimpleLoggerIntf} logger
     * @param {string} type
     * @param {any[]} ids
     * @param {string[]} byPasses
     * @async
     * @returns {Promise<Array<any>>}
     * @public
     */
    async readMetadataAtScale(type, ids, byPasses, logger) { throw new Error('Not implemented'); }
    
    /**
     * @description Method to get the list of sobjects
     * @param {SimpleLoggerIntf} logger
     * @async
     * @returns {Promise<Array<any>>}
     * @public
     */
    async describeGlobal(logger)  { throw new Error('Not implemented'); }

    /**
     * @description Method to describe one particular sobject
     * @param {string} sobjectDevName 
     * @param {SimpleLoggerIntf} logger
     * @async
     * @returns {Promise<any>}
     * @public
     */
    async describe(sobjectDevName, logger)  { throw new Error('Not implemented'); }
    
    /**
     * @description Method to get the record count (recycle bin included) of one particular sobject
     * @param {string} sobjectDevName 
     * @param {SimpleLoggerIntf} logger
     * @async
     * @returns {Promise<number>}
     * @public
     */
    async recordCount(sobjectDevName, logger)  { throw new Error('Not implemented'); }   

    /**
     * @description Method to run all apex test in the org
     * @param {SimpleLoggerIntf} logger
     * @async
     * @returns {Promise<string>}
     * @public
     */
    async runAllTests(logger) { throw new Error('Not implemented'); }

    /**
     * @description Method to run compile given apex classes
     * @param {Array<string>} apexClassIds
     * @param {SimpleLoggerIntf} logger
     * @async
     * @returns {Promise<Array<any>>}
     * @public
     */
    async compileClasses(apexClassIds, logger) { throw new Error('Not implemented'); }
}