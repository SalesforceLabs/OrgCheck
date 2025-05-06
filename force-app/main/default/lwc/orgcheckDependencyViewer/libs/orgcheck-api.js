/**
 * @description Cache item class
 */ 
class DataCacheItem {

    /** 
     * @type {string}
     */
    name;

    /** 
     * @type {boolean}
     */
    isEmpty;

    /** 
     * @type {boolean}
     */
    isMap;

    /** 
     * @type {number}
     */
    length;

    /** 
     * @type {number}
     */
    created;
}

/**
 * @description Global information stored in cache (both for data and metdata!)
 */ 
class ItemInCache {

    /** 
     * @type {number}
     */
    created;
}

/**
 * @description Data information stored in cache (not the metadata!)
 */ 
class DataItemInCache extends ItemInCache {

    /** 
     * @type {Array<any>}
     */
    content;
}

/**
 * @description Metadata information stored in cache (not the data!)
 */ 
class MetadataItemInCache extends ItemInCache {

    /** 
     * @type {string}
     */
    type;

    /** 
     * @type {number}
     */
    length;
}

/** 
 * @description Cache Manager interface
 */
class DataCacheManagerIntf {

    /**
     * @description Is the cache has a specific key?
     * @param {string} key 
     * @returns {boolean} true if the cache has the key, false if not
     * @public
     */
    has(key) { throw new Error('Not implemented'); }

    /**
     * @description Get the entry form the cache
     * @param {string} key 
     * @returns {Map | any}
     * @public
     */
    get(key) { throw new Error('Not implemented'); }

    /**
     * @description Set an entry into the cache with a given key
     * @param {string} key 
     * @param {Map | any} value
     * @public
     */
    set(key, value) { throw new Error('Not implemented'); }

    /**
     * @description Get details of the cache.
     * @returns {Array<DataCacheItem>} an array of objects that contains the name, the type, the size and the creation date of each entry.
     */
    details() { throw new Error('Not implemented'); }

    /**
     * @description Remove an entry of the cache.
     * @param {string} key 
     * @public
     */
    remove(key) { throw new Error('Not implemented'); }

    /**
     * @description Remove all entries in the cache.
     * @public
     */
    clear() { throw new Error('Not implemented'); }
}

const REGEX_COMMENTS_AND_NEWLINES = new RegExp('(\\/\\*[\\s\\S]*?\\*\\/|\\/\\/.*\\n|\\n)', 'gi');
const REGEX_ISINTERFACE = new RegExp("(?:public|global)\\s+(?:interface)\\s+\\w+(\\s+(?:extends)\\s+\\w+)?\\s*\\{", 'i');
const REGEX_ISENUM = new RegExp("(?:public|global)\\s+(?:enum)\\s+\\w+\\s*\\{", 'i');
const REGEX_ISTESTSEEALLDATA = new RegExp("@IsTest\\s*\\(.*SeeAllData=true.*\\)", 'i');
const REGEX_TESTNBASSERTS = new RegExp("(System.assert(Equals|NotEquals|)\\s*\\(|Assert\\.[a-zA-Z]*\\s*\\()", 'ig');
const REGEX_HARDCODEDURLS = new RegExp("([A-Za-z0-9-]{1,63}\\.)+[A-Za-z]{2,6}", 'ig');
const REGEX_HARDCODEDIDS = new RegExp("[,\"'\\s][a-zA-Z0-9]{5}0[a-zA-Z0-9]{9}([a-zA-Z0-9]{3})?[,\"'\\s]", 'ig');
const REGEX_HASSOQL = new RegExp("\\[\\s*(?:SELECT|FIND)");
const REGEX_HASDML = new RegExp("(?:insert|update|delete)\\s*(?:\\s\\w+|\\(|\\[)");
const SALESFORCE_DOMAINS = ['salesforce.com', '.force.'];

/**
 * @description Code Scanner class
 */ 
class CodeScanner {

    static RemoveComments(sourceCode) {
        return sourceCode?.replaceAll(REGEX_COMMENTS_AND_NEWLINES, ' ') || '';
    }

    static IsInterface(sourceCode) {
        return sourceCode?.match(REGEX_ISINTERFACE) !== null || false;
    }

    static IsEnum(sourceCode) {
        return sourceCode?.match(REGEX_ISENUM) !== null || false;
    }

    static FindHardCodedURLs(sourceCode) {
        return sourceCode?.match(REGEX_HARDCODEDURLS) // extract the domains
            ?.filter((domain) => SALESFORCE_DOMAINS.findIndex((sfdomain) => domain.indexOf(sfdomain) >= 0) >= 0)  // filter only the salesforce domains
            .sort() // sorting the domains (if any)
            .filter((e, i, s) => i === s.indexOf(e)); // unique domains
    }

    static FindHardCodedIDs(sourceCode) {
        return sourceCode?.match(REGEX_HARDCODEDIDS) // extract the salesforce ids
            ?.map(id => id?.substring(1, id?.length-1)) // remove the surrounding quotes or so
            .sort() // sorting the domains (if any)
            .filter((e, i, s) => i === s.indexOf(e)); // unique domains
    }

    static IsTestSeeAllData(sourceCode) {
        return sourceCode?.match(REGEX_ISTESTSEEALLDATA) !== null || false;
    }

    static CountOfAsserts(sourceCode) {
        return sourceCode?.match(REGEX_TESTNBASSERTS)?.length || 0;
    }

    static HasSOQL(sourceCode) {
        return sourceCode?.match(REGEX_HASSOQL) !== null || false; 
    }

    static HasDML(sourceCode) {
        return sourceCode?.match(REGEX_HASDML) !== null || false;
    }
}

/**
 * @description Dependency item using or referencing our dear main item
 */
class DataDependencyItem {

    /**
     * @description Salesforce ID of the item
     * @type {string}
     * @public
     */
    id;
    
    /**
     * @description Name of the item
     * @type {string}
     * @public
     */
    name;
    
    /**
     * @description Type of the item
     * @type {string}
     * @public
     */
    type;
    
    /**
     * @description URL of the item
     * @type {string}
     * @public
     */
    url;
}

/**
 * @description Dependencies between data given a main item (identified by the given WhatId)
 */
class DataDependencies {

    /**
     * @description List of items that the main item (identified by the given WhatId) is using
     * @type {boolean}
     * @public
     */
    hadError;

    /**
     * @description List of items that the main item (identified by the given WhatId) is using
     * @type {Array<DataDependencyItem>}
     * @public
     */
    using;

    /**
     * @description List of items that are using the main item (identified by the given WhatId)
     * @type {Array<DataDependencyItem>}
     * @public
     */
    referenced;

    /**
     * @description Count of items using the main item (identified by the given WhatId) grouped by types
     * @type {any}
     * @public
     */
    referencedByTypes;
}

/**
 * @description Factory of dependencies
 */
class DataDependenciesFactory {
    
    /**
     * @description Create a new instance of DataDependencies
     * @param {{ records: Array<{ id: string, name: string, type: string, url: string, refId: string, refName: string, refType: string, refUrl: string }>, errors: Array<string> }} data 
     * @param {Array<string>} whatIds 
     * @returns {DataDependencies}
     */
    static create(data, whatIds) {
        // Check if at least one of the whatIds is present in the data errors list
        if (data.errors?.some(errorId => whatIds.includes(errorId))) {
            return {
                hadError: true,
                using: [],
                referenced: [],
                referencedByTypes: {}
            };
        }
        // Data can contain a lot of dependencies from other ids, we just want to get the dependencies for the given whatIds
        // WhatID is using what? -- Here we are getting the dependencies where the ID is in the whatIds list
        const using = data.records.filter(e => whatIds.includes(e.id)).map(n => { 
            return { 
                id: n.refId, 
                name: n.refName, 
                type: n.refType,
                url: n.refUrl
            }; 
        });
        const referencedByTypes = {};
        // WhatID is referenced where? -- Here we are getting the dependencies where the REFID is in the whatIds list
        const referenced = data.records.filter(e => whatIds.includes(e.refId)).map(n => {
            if (referencedByTypes[n.type] === undefined) {
                referencedByTypes[n.type] = 1;
            } else {
                referencedByTypes[n.type]++; 
            }
            return { 
                id: n.id, 
                name: n.name, 
                type: n.type,
                url: n.url
            };
        });
        return {
            hadError: false,
            using: using,
            referenced: referenced,
            referencedByTypes: referencedByTypes
        }
    }
}

/**
 * @description This class represents a matrix data
 * @example Example of a DataMatrix would be:
 *               {
 *                  columnHeaders: [
 *                      { id: 'objectA', label: 'Object A', url: '...' }},
 *                      { id: 'objectB', label: 'Object B', url: '...' }},
 *                      { id: 'objectC', label: 'Object C', url: '...' }},
 *                      { id: 'objectD', label: 'Object D', url: '...' }}
 *                  ],
 *                  rows: [
 *                     { header: { label: 'Profile 1',        url: '...' }, data: { objectA: 'CR', objectB: 'CRU',                   objectD: 'R'     } },
 *                     { header: { label: 'Permission Set A', url: '...' }, data: { objectA: 'CR',                                   objectD: 'R'     } },
 *                     { header: { label: 'Permission Set B', url: '...' }, data: {                                objectC: 'CRUDm', objectD: 'CRUDm' } },
 *                  ]
 *               }
 */
class DataMatrix {

    /**
     * @description Information about the columns that could be found in the rows.data structure. Keys are the name fo the properties. Values are the information for this property.
     * @type {Array<any>}
     * @public
     */
    columnHeaders;

    /** 
     * @description List of data for each "row". A row will have a headerId (used as row header in the matrix view). And data is an object with as many properties.
     * @type {Array<DataMatrixRow>}
     * @public
     */
    rows;
}

/**
 * @description This class represents a column header in a matrix data.
 */ 
class DataMatrixColumnHeader {
    
    /**
     * @description Key to be used as a property of rows.data
     * @type {string}
     * @public
     */
    id;
    
    /** 
     * @description If specify this describe the columns better than just an id
     * @type {any}
     * @public
     */
    ref;
}

/**
 * @description This class represents a row in a matrix data.
 */ 
class DataMatrixRow {
    
    /**
     * @description Header reference of the matrix row
     * @type {any}
     * @public
     */
    header;
    
    /** 
     * @description Data of the row as an object with dynamic properties (defined in the parent DataMatrix object).
     * @type {any}
     * @public
     * @see DataMatrix
     */
    data;
}

/**
 * @description This class represents a factory to create DataMatrixWorking objects.
 */ 
class DataMatrixFactory {

    /**
     * @description Create a new instance of DataMatrixWorking
     * @returns {DataMatrixWorking}
     */
    static create() {
        return new DataMatrixWorking();
    }
}

/**
 * @description This class represents a matrix data beeing processed by the factory, once done you can turn this instance into a DataMatrix
 */
class DataMatrixWorking {
    
    /**
     * @description Constructor
     * @public
     */
    constructor() {
        this._columnIds = new Set();
        this._columns = new Map();
        this._rows = new Map();
    }
    
    /**
     * @description Convert this working object into a data matrix object
     * @returns {DataMatrix}
     */
    toDataMatrix() {
        const columnHeaders = [];
        this._columnIds.forEach((columnId) => {
            columnHeaders.push(this._columns.has(columnId) ? this._columns.get(columnId) : columnId);
        });
        return { 
            columnHeaders: columnHeaders,
            rows: Array.from(this._rows.values()) 
        };
    }

    /**
     * @description Add a value to the property of a specific row given its id
     * @param {string} rowId 
     * @param {string} columnId 
     * @param {string} value 
     * @public
     */
    addValueToProperty(rowId, columnId, value) {
        if (this._rows.has(rowId) === false) {
            this._rows.set(rowId, { header: {}, data: {}});
        }
        this._rows.get(rowId).data[columnId] = value;
        this._columnIds.add(columnId);
    }

    /**
     * @description Check if the header column has been already specified
     * @param {string} columnId
     * @returns {boolean}
     */
    hasColumnHeader(columnId) {
        return this._columns.has(columnId);
    }
    
    /**
     * @description Set the header column
     * @param {string} columnId
     * @param {any} columnRef
     */
    setColumnHeader(columnId, columnRef) {
        this._columns.set(columnId, columnRef);
    }
   
    /**
     * @description Check if the header row has been already specified
     * @param {string} rowId
     * @returns {boolean}
     */
    hasRowHeader(rowId) {
        return this._rows.has(rowId) && this._rows.get(rowId).header;
    }
    
    /**
     * @description Set the header row
     * @param {string} rowId
     * @param {any} rowRef
     */
    setRowHeader(rowId, rowRef) {
        if (this._rows.has(rowId) === true) {
            this._rows.get(rowId).header = rowRef; 
        } else {
            this._rows.set(rowId, { header: rowRef, data: {}});
        }
    }
   
    /**
     * @type {Set<string>}
     * @private
     */
    _columnIds;

    /**
     * @type {Map<string, any>}}
     * @private
     */
    _columns;

    /**
     * @type {Map<string, DataMatrixRow>}
     * @private
     */
    _rows;
}

/**
 * @description This class represents a set of information around a unique instance of a specific artefact (like User, Profile, UserRole, ...) 
 *   Such class are created by a "data factory" (see DataFactory) which also computes its "score" based on specific best practices rules. 
 */
class Data {
    
    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { console.error('Need to implement static label() method for', this, JSON.stringify(this), this.name); return this.name; };

    /**
     * @description Badness score of the data. Zero means the data follows best practices. Positive value means some areas need to be corrected.
     * @type {number}
     * @public
     */
    score;
    
    /**
     * @description If the above score is positive, then this property will contain a list of fields that need to be corrected.
     * @type {Array<string>}
     * @public
     */
    badFields;
    
    /**
     * @description If the above score is positive, then this property will contain a list of reasons ids that explain why the score is positive.
     * @type {Array<string>}
     * @public
     */
    badReasonIds;
}

/**
 * @description In some cases, the DAPI can retrieve dependencies for org check data and having dependencies participate in the computation of the score.
 */
class DataWithDependencies extends Data {

    /**
     * @description Optionnal dependencies information for this data.
     * @type {DataDependencies}
     * @public
     */
    dependencies;
}

/**
 * @description This class represents a set of information around a unique instance of a specific artefact (like User, Profile, UserRole, ...) 
 *   Such class are created by a "data factory" (see DataFactory) BUT do not need any scoring. 
 */
class DataWithoutScoring {}

/**
 * @description Org Check "score rule" used to qualify if an item is bad or not
 * @public
 */
class ScoreRule {

    /**
     * @description Unique identifier of that rule
     * @type {number}
     * @public
     */
    id;

    /**
     * @description Description of that rule
     * @type {string}
     * @public
     */
    description;
    
    /**
     * @description Rule's formula with the data as only parameter. Function returns true or false.
     * @type {Function}
     * @public
     */
    formula;

    /**
     * @description Message to show if the formula returns false for a given data.
     * @type {string}
     * @public
     */
    errorMessage;

    /**
     * @description Technical name of the field that is considered 'bad'
     * @type {string}
     * @public
     */    
    badField;

    /**
     * @description For which data this rule is applicable?
     * @type {Array<any>}
     * @public
     */    
    applicable;
}

/**
 * @description Data factory interface
 * @public
 */
class DataFactoryIntf {

    /**
     * @description Get the instance of the factiry for a given data class
     * @param {any} dataClass 
     * @returns {DataFactoryInstanceIntf}
     * @throws if the given dataClass is not an instance of Data or DataWithoutScoring
     * @public
     */
    getInstance(dataClass) { throw new Error('Not implemented'); }   
}

/**
 * @description Data factory interface for a given data class
 * @public
 */
class DataFactoryInstanceIntf {

    /**
     * @description Creates a new instance of the given data class without computing the score
     * @param {any} configuration 
     * @returns {any}
     * @throws if configuration is null or configuration.properties is null
     * @public
     */
    create(configuration) { throw new Error('Not implemented'); }   

    /**
     * @description Computes the score on an existing row
     * @param {any} row 
     * @returns {any}
     * @public
     */
    computeScore(row) { throw new Error('Not implemented'); }   

    /**
     * @description Creates a new instance of the given data class AND computes the score
     * @param {any} configuration 
     * @returns {any}
     * @throws if configuration is null or configuration.properties is null
     * @public
     */
    createWithScore(configuration) { throw new Error('Not implemented'); }   
}

/**
 * @description Dataset Run Information
 */
class DatasetRunInformation {
    
    /**
     * @type {string}
     * @public
     */
    alias;

    /**
     * @type {string}
     * @public
     */
    cacheKey;

    /**
     * @type {Map}
     * @public
     */
    parameters;
    
    /**
     * @description Constructor
     * @param {string} alias 
     * @param {string} cacheKey 
     */
    constructor(alias, cacheKey) {
        this.alias = alias;
        this.cacheKey = cacheKey;
        this.parameters = new Map();
    }
}

/**
 * @description Basic logger Interface for  
 */ 
class BasicLoggerIntf {

    /**
     * @description The logger logs
     * @param {string} operationName
     * @param {string} [message] 
     * @public
     */
    log(operationName, message) { throw new TypeError(`You need to implement the method "log()"`); }

    /**
     * @description The given operation ended (with an optional message)
     * @param {string} operationName
     * @param {string} [message] 
     * @public
     */
    ended(operationName, message) { throw new TypeError(`You need to implement the method "ended()"`); }

    /**
     * @description The given operation failed (with an optional message/error)
     * @param {string} operationName
     * @param {Error | string} [error] 
     * @public
     */
    failed(operationName, error) { throw new TypeError(`You need to implement the method "failed()"`); }
}

/**
 * @description Logger Interface for  
 */ 
class LoggerIntf extends BasicLoggerIntf {

    /**
     * @description Turn this logger into a simple logger for a specific operation
     * @param {string} operationName 
     * @returns {SimpleLoggerIntf}
     */ 
    toSimpleLogger(operationName) { throw new TypeError(`You need to implement the method "toSimpleLogger()"`); }
}

/**
 * @description Simple Logger interface
 */
class SimpleLoggerIntf {

    /**
     * @description Simple log method with a message to output somewhere
     * @type {(message: string) => void}
     * @public
     */
    log(message) { throw new TypeError(`You need to implement the method "log()"`); };

    /**
     * @description Simple debug method with a message to output somewhere
     * @type {(message: string) => void}
     * @public
     */
    debug(message) { throw new TypeError(`You need to implement the method "debug()"`); };
}

/**
 * @description Threshold value when percentage is reaching a "warning" zone (not yet a "critical" zone)
 * @type {number}
 * @private
 */
const DAILY_API_REQUEST_WARNING_THRESHOLD = 0.70; // =70%
 
/**
 * @description Threshold value when percentage is reaching a "critical" zone.
 * @type {number}
 * @private
*/
const DAILY_API_REQUEST_FATAL_THRESHOLD = 0.90; // =90%

/**
 * @description If limit information are older than this, force a refresh
 * @type {number}
 * @private
 */
const IF_LIMIT_INFO_ARE_OLDER_THAN_THIS_FORCE_REFRESH = 1*60*1000; // =1 minute

/**
 * @description Information about the current Daily API Request usage limit
 */
class SalesforceUsageInformation {

    /**
     * @description Current ratio (not percentage!) of Daily API Request limit usage
     * @type {number}
     * @public
     */
    currentUsageRatio = 0;

    /**
     * @description Current percentage of Daily API Request limit usage
     * @type {string}
     * @public
     */
    currentUsagePercentage = '';

    /**
     * @description Threshold value when percentage is reaching a "warning" zone (not yet a "critical" zone)
     * @type {number}
     * @public
     */
    get yellowThresholdPercentage() {
        return DAILY_API_REQUEST_WARNING_THRESHOLD;
    }

    /**
     * @description Threshold value when percentage is reaching a "critical" zone.
     * @type {number}
     * @public
     */
    get redThresholdPercentage() {
        return DAILY_API_REQUEST_FATAL_THRESHOLD;
    }

    /**
     * @description Is the current percentage in the "OK" zone?
     * @type {boolean}
     * @public
     */
    get isGreenZone() {
        return this.currentUsageRatio < DAILY_API_REQUEST_WARNING_THRESHOLD;
    }

    /**
     * @description Is the current percentage in the "warning" zone?
     * @type {boolean}
     * @public
     */
    get isYellowZone() {
        return this.currentUsageRatio >= DAILY_API_REQUEST_WARNING_THRESHOLD &&
               this.currentUsageRatio < DAILY_API_REQUEST_FATAL_THRESHOLD;
    }

    /**
     * @description Is the current percentage in the "critical" zone?
     * @type {boolean}
     * @public
     */
    get isRedZone() {
        return this.currentUsageRatio >= DAILY_API_REQUEST_FATAL_THRESHOLD;
    }
}

/**
 * @description Watchdog to make sure you don't use too much Salesforce Daily API Request
 */
class SalesforceWatchDog {

    /**
     * @description Constructor
     * @param {() => { used: number, max: number }} apiLimitExtractor
     * @public
     */
    constructor(apiLimitExtractor) {
        this._apiLimitExtractor = apiLimitExtractor;
        this._lastRequestToSalesforce = undefined;
        this._lastApiUsage = new SalesforceUsageInformation();
    }

    /**
     * @description Function that knows how to return the current API limit usage
     * @type {() => { used: number, max: number }}
     * @private
     */
    _apiLimitExtractor;

    /**
     * @description Timestamp of the last request we have made to Salesforce.
     *   Why we do this? to better appreciate the limitInfo we have from the last request.
     *   If the information is fresh then no need to ask again the API, if not we need to try calling.
     * @type {number}
     * @private
     */
    _lastRequestToSalesforce;

    /**
     * @description Last ratio the Salesforce API gave us about the Daily API Request. 
     * @type {SalesforceUsageInformation}
     * @private
     */
    _lastApiUsage;

    /**
     * @description Before calling the Salesforce API, this is a watch dog to make sure we don't exceed the daily API request limit
     * @param {function} [callback]
     * @throws {TypeError} If we reach the limit
     * @public
     */
    beforeRequest(callback) {
        if (this._lastRequestToSalesforce && 
            Date.now() - this._lastRequestToSalesforce <= IF_LIMIT_INFO_ARE_OLDER_THAN_THIS_FORCE_REFRESH && 
            this._lastApiUsage.isRedZone
        ) {
            const error = new TypeError(
                `WATCH DOG: Daily API Request limit is ${RATIO_TO_PERCENTAGE(this._lastApiUsage.currentUsageRatio)}%, `+
                `and our internal threshold is ${RATIO_TO_PERCENTAGE(this._lastApiUsage.redThresholdPercentage)}%. `+
                'We stop there to keep your org safe.'
            );
            if (callback) callback(error); 
            throw error;
        }
    }

    /**
     * @description After calling the Salesforce API, this is a watch dog to make sure we don't exceed the daily API request limit
     * @param {function} [callback]
     * @throws {TypeError} If we reach the limit
     * @public
     */
    afterRequest(callback) {
        const apiUsage = this._apiLimitExtractor();
        if (apiUsage) {
            this._lastApiUsage.currentUsageRatio = apiUsage.used / apiUsage.max;
            this._lastApiUsage.currentUsagePercentage = RATIO_TO_PERCENTAGE(this._lastApiUsage.currentUsageRatio); 
            this._lastRequestToSalesforce = Date.now();
            this.beforeRequest(callback);
        }
    }

    /**
     * @description Get the lastest Daily API Usage from JSForce, and the level of confidence we have in this ratio to continue using org check.
     * @returns {SalesforceUsageInformation} Information of the current usage of the Daily Request API
     * @public
     */
    get dailyApiRequestLimitInformation() {
        return this._lastApiUsage;
    }
}

/**
 * @description Return the percentage representation of a ratio as a string (without the percentage sign)
 * @param {number} ratio 
 * @param {number} [decimals=2]
 * @returns {string}
 * @private
 */
const RATIO_TO_PERCENTAGE = (ratio, decimals=2) => {
    return (ratio*100).toFixed(decimals);
};

class SFDC_ApexTestMethodResult extends DataWithoutScoring {

    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Apex Test Result' };

    /**
     * @description Name of this method
     * @type {string}
     * @public
     */
    methodName;

    /**
     * @description Is this method was successful or failed
     * @type {boolean}
     * @public
     */
    isSuccessful;

    /**
     * @description Runtime of that method whatever its result
     * @type {number}
     * @public
     */
    runtime;

    /**
     * @description If the method failed this is the error stack trace
     * @type {string}
     * @public
     */
    stacktrace;

    /**
     * @description CPU consumption during the test
     * @type {number}
     * @public
     */
    cpuConsumption;

    /**
     * @description Async Calls consumption during the test
     * @type {number}
     * @public
     */
    asyncCallsConsumption;

    /**
     * @description SOSL consumption during the test
     * @type {number}
     * @public
     */
    soslConsumption;

    /**
     * @description SOQL consumption during the test
     * @type {number}
     * @public
     */
    soqlConsumption;

    /**
     * @description Query Rows consumption during the test
     * @type {number}
     * @public
     */
    queryRowsConsumption;

    /**
     * @description DML Rows consumption during the test
     * @type {number}
     * @public
     */
    dmlRowsConsumption;

    /**
     * @description DML consumption during the test
     * @type {number}
     * @public
     */
    dmlConsumption;
}

/**
 * @description Representation of an Apex Class in Org Check
 */
class SFDC_ApexClass extends DataWithDependencies {

    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Apex Class' };

    /**
     * @description Salesforce Id
     * @type {string}
     * @public
     */
    id;
    
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name;
    
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url;
    
    /**
     * @description API Version (as a number) set in the metadata for this item.
     * @type {number}
     * @public
     */
    apiVersion;
    
    /**
     * @description Name of the potential namespace/package where this item comes from. Empty string if none.
     * @type {string}
     * @public
     */
    package;

    /**
     * @description Is this class a test class?
     * @type {boolean}
     * @public
     */
    isTest;

    /**
     * @description Is this class a test class with See All Data option?
     * @type {boolean}
     * @public
     */
    isTestSeeAllData;

    /**
     * @description Number of direct asserts in this class (if it's a test class)
     * @type {number}
     * @public
     */
    nbSystemAsserts;

    /**
     * @description Is this class with the Asbtract modifier?
     * @type {boolean}
     * @public
     */
    isAbstract;

    /**
     * @description Is this a class? (and not an interface or an enum)
     * @type {boolean}
     * @public
     */
    isClass;

    /**
     * @description Is this an enum? (and not an interface or a class)
     * @type {boolean}
     * @public
     */
    isEnum;

    /**
     * @description Is this an interface? (and not a class or an enum)
     * @type {boolean}
     * @public
     */
    isInterface;

    /**
     * @description Number of inner classs in this class
     * @type {number}
     * @public
     */
    innerClassesCount;

    /**
     * @description Is this a class implements Schedulable?
     * @type {boolean}
     * @public
     */
    isSchedulable;

    /**
     * @description Is this Schedulable class even scheduled in this org?
     * @type {boolean}
     * @public
     */
    isScheduled;

    /**
     * @description List of interface that this class implements
     * @type {Array<string>}
     * @public
     */
    interfaces;
    
    /**
     * @description List of super class that this class extends
     * @type {Array<string>}
     * @public
     */
    extends;

    /**
     * @description Number of methods in this class (Note: if the class is a test, this not only the testing methods, this is ALL the methods)
     * @type {number}
     * @public
     */
    methodsCount;

    /**
     * @description List of test methods that were OK in the last run results but took more than 20 seconds
     * @type {Array<SFDC_ApexTestMethodResult>}
     * @public
     */
    testPassedButLongMethods;

    /**
     * @description List of test methods that were OK in the last run results
     * @type {Array<SFDC_ApexTestMethodResult>}
     * @public
     */
    testFailedMethods;

    /**
     * @description Date/Time when this test class was last run. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastTestRunDate;

    /**
     * @description Entire time (at the class level) it took to run all test methods (whatever their result) during the last run.
     * @type {number}
     * @public
     */
    testMethodsRunTime;

    /**
     * @description List of annotations that this class uses
     * @type {Array<string>}
     * @public
     */
    annotations;

    /**
     * @description Specified sharing mode for this class
     * @type {string}
     * @public
     */
    specifiedSharing;

    /**
     * @description Specified access mode for this class
     * @type {string}
     * @public
     */
    specifiedAccess;

    /**
     * @description Number of characters used in the class (without comments)
     * @type {number}
     * @public
     */
    length;

    /**
     * @description Unique list of hard coded Salesforce URLs in this item
     * @type {Array<string>}
     * @public
     */
    hardCodedURLs;

    /**
     * @description Unique list of hard coded Salesforce IDs in this item
     * @type {Array<string>}
     * @public
     */
    hardCodedIDs;

    /**
     * @description When we do not have compiler information about this class, it means it needs to be recompiled manually.
     * @type {boolean}
     * @public
     */
    needsRecompilation;

    /**
     * @description Current code coverage of this class. May vary if you have run all test classes or not.
     * @type {number}
     * @public
     */
    coverage;

    /**
     * @description List of test class Ids that participate in the current code coverage of this class (if this is a not test class).
     * @type {Array<string>}
     * @public
     */
    relatedTestClassIds;

    /**
     * @description List of test class that participate in the current code coverage of this class (if this is a not test class).
     * @type {Array<SFDC_ApexClass>}
     * @public
     */
    relatedTestClassRefs;

    /**
     * @description List of class Ids that are tested by this class (if this is a test class).
     * @type {Array<string>}
     * @public
     */
    relatedClassIds;

    /**
     * @description List of class that are tested by this class (if this is a test class).
     * @type {Array<SFDC_ApexClass>}
     * @public
     */
    relatedClassRefs;
    
    /**
     * @description Date/Time when this item was created in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    createdDate;
    
    /**
     * @description Date/Time when this item was last modified in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastModifiedDate;
}

/**
 * @description Salesforce Query request
 */
class SalesforceQueryRequest {

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
class SalesforceMetadataRequest {
    
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
class SalesforceManagerIntf {

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

/**
 * @description Base class for all datasets
 */
class Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager
     * @param {DataFactoryIntf} dataFactory
     * @param {SimpleLoggerIntf} logger
     * @param { Map | undefined } [parameters] List of optional argument to pass
     * @returns {Promise<Map<string, Data | DataWithoutScoring> | Data | DataWithoutScoring>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger, parameters) {
        throw new TypeError('You need to implement the method "run()"');
    }
}

/**
 * @description Dataset manager interface
 */
class DatasetManagerIntf {

    /**
     * @description Run the given list of datasets and return them as a result
     * @param {Array<string | DatasetRunInformation>} datasets 
     * @returns {Promise<Map>}
     * @public
     * @async
     */
    async run(datasets) { throw new TypeError(`You need to implement the method "run()"`); }

    /**
     * @description Clean the given list of datasets from cache (if present)
     * @param {Array<string | DatasetRunInformation>} datasets 
     * @public
     */
    clean(datasets) { throw new TypeError(`You need to implement the method "clean()"`); }
}

/**
 * @description Dataset aliases
 * @property {string} APEXCLASSES
 * @property {string} APEXTRIGGERS
 * @property {string} APPLICATIONS
 * @property {string} APPPERMISSIONS
 * @property {string} CURRENTUSERPERMISSIONS
 * @property {string} CUSTOMFIELDS
 * @property {string} CUSTOMLABELS
 * @property {string} FLOWS
 * @property {string} GROUPS
 * @property {string} LIGHTNINGAURACOMPONENTS
 * @property {string} LIGHTNINGPAGES
 * @property {string} LIGHTNINGWEBCOMPONENTS
 * @property {string} OBJECT
 * @property {string} OBJECTPERMISSIONS
 * @property {string} OBJECTS
 * @property {string} OBJECTTYPES
 * @property {string} ORGANIZATION
 * @property {string} PACKAGES
 * @property {string} PAGELAYOUTS
 * @property {string} PERMISSIONSETS
 * @property {string} PERMISSIONSETLICENSES
 * @property {string} PROFILEPWDPOLICIES
 * @property {string} PROFILERESTRICTIONS
 * @property {string} PROFILES
 * @property {string} USERROLES
 * @property {string} USERS
 * @property {string} VALIDATIONRULES
 * @property {string} VISUALFORCECOMPONENTS
 * @property {string} VISUALFORCEPAGES
 * @property {string} WORKFLOWS
 */
const DatasetAliases = {
    APEXCLASSES: 'apex-classes',
    APEXTRIGGERS: 'apex-triggers',
    APPLICATIONS: 'applications',
    APPPERMISSIONS: 'app-permisions',
    CURRENTUSERPERMISSIONS: 'current-user-permissions',
    CUSTOMFIELDS: 'custom-fields',
    CUSTOMLABELS: 'custom-labels',
    FIELDPERMISSIONS: 'field-permissions',
    FLOWS: 'flows',
    GROUPS: 'groups',
    LIGHTNINGAURACOMPONENTS: 'lightning-aura-components',
    LIGHTNINGPAGES: 'lightning-pages',
    LIGHTNINGWEBCOMPONENTS: 'lightning-web-components',
    OBJECT: 'object',
    OBJECTPERMISSIONS: 'object-permissions',
    OBJECTS: 'objects',
    OBJECTTYPES: 'object-types',
    ORGANIZATION: 'org-information',
    PACKAGES: 'packages',
    PAGELAYOUTS: 'page-layouts',
    PERMISSIONSETS: 'permission-sets',
    PERMISSIONSETLICENSES: 'permission-set-licenses',
    PROFILEPWDPOLICIES: 'profile-password-policies',
    PROFILERESTRICTIONS: 'profile-restrictions',
    PROFILES: 'profiles',
    USERROLES: 'user-roles',
    USERS: 'users',
    VALIDATIONRULES: 'validation-rules',
    VISUALFORCECOMPONENTS: 'visual-force-components',
    VISUALFORCEPAGES: 'visual-force-pages',
    WORKFLOWS: 'workflows'
};
Object.seal(DatasetAliases);

class Processor {

    /**
     * @description Runs in parallel a function for each item of a given array or map.
     * @param {Array | Map} iterable  An array or a map to iterate over
     * @param {Function} iteratee  A function to call on each item in the array. Invoked with (item). Not supposed to return anything.
     * @returns Promise<void>
     */
    static async forEach(iterable, iteratee) {
        if (!iterable) return Promise.resolve();
        if (typeof iteratee !== 'function') throw new TypeError(`Given iteratee is not a proper Function.`);
        if (Array.isArray(iterable) === true) return Promise.all(iterable.map(async (item) => { await iteratee(item); return null; } ));
        if (iterable instanceof Map === true) {
            const promises = [];
            iterable.forEach((item, key) => promises.push(new Promise((resolve) => { iteratee(item, key); resolve(); })));
            return Promise.all(promises);
        }
        throw new TypeError(`Given iterable is not a proper Array nor Map.`);        
    }

    /**
     * @description Runs in parallel a function for each item of a given iterable (must be an Array), and 
     *   constructs a new array with the same size but with the results of each call to the function.
     * @param {Array} iterable  An array to iterate over
     * @param {Function} iteratee  A function to call on each item in the array. Invoked with (item). Supposed to return a new item based on the original item.
     * @param {Function} [filterIteratee]  An optional function to call on each item in the array. Invoked with (item). Returns true or false.
     * @returns Promise<Array>  
     */
    static async map(iterable, iteratee, filterIteratee) {
        if (!iterable) return Promise.resolve([]);
        if (Array.isArray(iterable) === false) throw new TypeError(`Given iterable is not a proper Array.`);
        if (typeof iteratee !== 'function') throw new TypeError(`Given iteratee is not a proper Function.`);
        if (filterIteratee && typeof filterIteratee !== 'function') throw new TypeError(`Given filterIteratee is not a proper Function.`);
        return Promise.all((filterIteratee ? iterable.filter((item) => filterIteratee(item)) : iterable).map(async (item) => iteratee(item)));
    }
}

/**
 * @description The super class for all recipes. 
 */
class Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {SimpleLoggerIntf} logger
     * @param { ... | undefined } [parameters] List of optional argument to pass
     * @returns {Array<string | DatasetRunInformation>}
     * @public
     */
    extract(logger, ...parameters) {
        throw new TypeError(`You need to implement the method "extract()"`);
    }

    /**
     * @description transform the data from the datasets and return the final result as an Array
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} logger
     * @param { ... | undefined } [parameters] List of optional argument to pass
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger, ...parameters) {
        throw new TypeError(`You need to implement the method "transform()"`);
    }
}

/**
 * @description Recipe Manager interface
 */ 
class RecipeManagerIntf {

    /**
     * @description Runs a designated recipe (by its alias)
     *   - Step 1. Extract the list of datasets to run that this recipe uses
     *   - Step 2. Run the given datasets and gather the global data retrieved
     *   - Step 3. Transform the retrieved data and return the final result as a Map
     * @param {string} alias String representation of a recipe -- use one of the RECIPE_*_ALIAS constants available in this unit.
     * @param {Array<string|object>} parameters List of values to pass to the exract and tranform methods of the recipe.
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map>} Returns as it is the value returned by the transform method recipe.
     * @async
     * @public
     */
    async run(alias, ...parameters) { throw new TypeError(`You need to implement the method "run()"`); }

    /**
     * @description Cleans a designated recipe (by its alias) and the corresponding datasets.
     *    - Step 1. Extract the list of datasets to clean that this recipe uses
     *    - Step 2. Clean the given datasets
     * @param {string} alias String representation of a recipe -- use one of the RECIPE_*_ALIAS constants available in this unit.
     * @param {Array<string|object>} [parameters] List of values to pass to the exract method of the recipe.
     * @public
     */
    clean(alias, ...parameters) { throw new TypeError(`You need to implement the method "clean()"`); }
}

/**
 * @description Recipe aliases
 * @property {string} ACTIVE_USERS
 * @property {string} APEX_CLASSES
 * @property {string} APEX_TESTS
 * @property {string} APEX_TRIGGERS
 * @property {string} APEX_UNCOMPILED
 * @property {string} APP_PERMISSIONS
 * @property {string} CURRENT_USER_PERMISSIONS
 * @property {string} CUSTOM_FIELDS
 * @property {string} CUSTOM_LABELS
 * @property {string} FIELD_PERMISSIONS
 * @property {string} FLOWS
 * @property {string} LIGHTNING_AURA_COMPONENTS
 * @property {string} LIGHTNING_PAGES
 * @property {string} LIGHTNING_WEB_COMPONENTS
 * @property {string} OBJECT
 * @property {string} OBJECT_PERMISSIONS
 * @property {string} OBJECT_TYPES
 * @property {string} OBJECTS
 * @property {string} ORGANIZATION
 * @property {string} PACKAGES
 * @property {string} PAGE_LAYOUTS
 * @property {string} PERMISSION_SETS
 * @property {string} PERMISSION_SET_LICENSES
 * @property {string} PROCESS_BUILDERS
 * @property {string} PROFILE_PWD_POLICIES
 * @property {string} PROFILE_RESTRICTIONS
 * @property {string} PROFILES
 * @property {string} PUBLIC_GROUPS
 * @property {string} QUEUES
 * @property {string} USER_ROLES
 * @property {string} VALIDATION_RULES
 * @property {string} VISUALFORCE_COMPONENTS
 * @property {string} VISUALFORCE_PAGES
 * @property {string} WORKFLOWS
 */
const RecipeAliases = {
    ACTIVE_USERS: 'active-users',
    APEX_CLASSES: 'apex-classes',
    APEX_TESTS: 'apex-tests',
    APEX_TRIGGERS: 'apex-triggers',
    APEX_UNCOMPILED: 'apex-uncompiled',
    APP_PERMISSIONS: 'app-permissions',
    CURRENT_USER_PERMISSIONS: 'current-user-permissions',
    CUSTOM_FIELDS: 'custom-fields',
    CUSTOM_LABELS: 'custom-labels',
    FIELD_PERMISSIONS: 'field-permissions',
    FLOWS: 'flows',
    LIGHTNING_AURA_COMPONENTS: 'lightning-aura-components',
    LIGHTNING_PAGES: 'lightning-pages',
    LIGHTNING_WEB_COMPONENTS: 'lightning-web-components',
    OBJECT: 'object',
    OBJECT_PERMISSIONS: 'object-permissions',
    OBJECTS: 'objects',
    OBJECT_TYPES: 'object-types',
    ORGANIZATION: 'org-information',
    PACKAGES: 'packages',
    PAGE_LAYOUTS: 'page-layouts',
    PERMISSION_SETS: 'permission-sets',
    PERMISSION_SET_LICENSES: 'permission-set-licenses',
    PROCESS_BUILDERS: 'process-builders',
    PROFILE_PWD_POLICIES: 'profile-password-policies',
    PROFILE_RESTRICTIONS: 'profile-restrictions',
    PROFILES: 'profiles',
    PUBLIC_GROUPS: 'public-groups',
    QUEUES: 'queues',
    USER_ROLES: 'user-roles',
    VALIDATION_RULES: 'validation-rules',
    VISUALFORCE_COMPONENTS: 'visualforce-components',
    VISUALFORCE_PAGES: 'visualforce-pages',
    WORKFLOWS: 'workflows'
};
Object.seal(RecipeAliases);

/**
 * @description Metadata types
 */
const SalesforceMetadataTypes = {
    ANY_FIELD: 'Field',
    APEX_CLASS: 'ApexClass',
    APEX_TRIGGER: 'ApexTrigger',
    AURA_WEB_COMPONENT: 'AuraDefinitionBundle',
    CUSTOM_BIG_OBJECT: 'CustomBigObject',
    CUSTOM_EVENT: 'CustomEvent',
    CUSTOM_FIELD: 'CustomField',
    CUSTOM_LABEL: 'CustomLabel',
    CUSTOM_METADATA_TYPE: 'CustomMetadataType',
    CUSTOM_OBJECT: 'CustomObject',
    CUSTOM_SETTING: 'CustomSetting',
    CUSTOM_SITE: 'CustomSite',
    CUSTOM_TAB: 'CustomTab',
    EXTERNAL_OBJECT: 'ExternalObject',
    FIELD_SET: 'FieldSet',
    FLOW_DEFINITION: 'FlowDefinition',
    FLOW_VERSION: 'Flow',
    KNOWLEDGE_ARTICLE: 'KnowledgeArticle',
    LIGHTNING_PAGE: 'FlexiPage',
    LIGHTNING_WEB_COMPONENT: 'LightningComponentBundle',
    PAGE_LAYOUT: 'Layout',
    PERMISSION_SET: 'PermissionSet',
    PERMISSION_SET_GROUP: 'PermissionSetGroup',
    PERMISSION_SET_LICENSE: 'PermissionSetLicense',
    PROFILE: 'Profile',
    PUBLIC_GROUP: 'PublicGroup',
    QUEUE: 'Queue',
    RECORD_TYPE: 'RecordType',
    ROLE: 'UserRole',
    TECHNICAL_GROUP: 'TechnicalGroup',
    STANDARD_FIELD: 'StandardField',
    STANDARD_OBJECT: 'StandardEntity',
    STATIC_RESOURCE: 'StaticResource',
    USER: 'User',
    VALIDATION_RULE: 'ValidationRule',
    VISUAL_FORCE_COMPONENT: 'ApexComponent',
    VISUAL_FORCE_PAGE: 'ApexPage',
    WEB_LINK: 'WebLink',
    WORKFLOW_RULE: 'WorkflowRule'
};
Object.seal(SalesforceMetadataTypes);

/**
 * @description Representation of a Standard Field or a Custom Field in Org Check
 */
class SFDC_Field extends DataWithDependencies {
    
    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Standard or Custom Field' };

    /**
     * @description Salesforce Id
     * @type {string}
     * @public
     */
    id;
    
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url;
    
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name;
    
    /**
     * @description Label
     * @type {string}
     * @public
     */
    label;
    
    /**
     * @description Name of the potential namespace/package where this item comes from. Empty string if none.
     * @type {string}
     * @public
     */
    package;
    
    /**
     * @description Full description of that item
     * @type {string}
     * @public
     */
    description;
    
    /**
     * @description Date/Time when this item was created in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    createdDate;
    
    /**
     * @description Date/Time when this item was last modified in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastModifiedDate;

    /**
     * @description Salesforce Id of the sObject where this field is defined
     * @type {string}
     * @public
     */
    objectId; 

    /**
     * @description Reference of the object for this field
     * @type {SFDC_Object}
     * @public
     */
    objectRef;

    /**
     * @description Is tgis field custom or standard
     * @type {boolean}
     * @public
     */
    isCustom;

    /**
     * @description Tooltip
     * @type {string}
     * @public
     */
    tooltip;

    /**
     * @description Type of this field
     * @type {string}
     * @public
     */
    type;

    /**
     * @description Length of this field in addition to its type
     * @type {number}
     * @public
     */
    length;

    /**
     * @description Is this field unique?
     * @type {boolean}
     * @public
     */
    isUnique;

    /**
     * @description Is this field encrypted?
     * @type {boolean}
     * @public
     */
    isEncrypted;

    /**
     * @description Is this field set as an external id?
     * @type {boolean}
     * @public
     */
    isExternalId;

    /**
     * @description Is this field uses an index in the table?
     * @type {boolean}
     * @public
     */
    isIndexed;

    /**
     * @description Default value
     * @type {string}
     * @public
     */
    defaultValue;

    /**
     * @description If this is a picklist, is it restricted to a list of values?
     * @type {boolean}
     * @public
     */
    isRestrictedPicklist;

    /**
     * @description What is the formula of that field? (obviously only for formula field!)
     * @type {string}
     * @public
     */
    formula;

    /**
     * @description Only for formula field -- List of unique hard coded Salesforce URLs in the formula
     * @type {Array<string>}
     * @public
     */
    hardCodedURLs;

    /**
     * @description Only for formula field -- List of unique hard coded Salesforce IDs in the formula
     * @type {Array<string>}
     * @public
     */
    hardCodedIDs;

}

/**
 * @description Representation of a Field Set in Org Check
 */
class SFDC_FieldSet extends Data {
    
    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Field Set' };

    /**
     * @description Salesforce Id
     * @type {string}
     * @public
     */
    id;
    
    /**
     * @description Label
     * @type {string}
     * @public
     */
    label;
    
    /**
     * @description Full description of that item
     * @type {string}
     * @public
     */
    description;
    
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url;
}

/**
 * @description Representation of a Lightning Page in Org Check
 */
class SFDC_LightningPage extends DataWithDependencies {
    
    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Lightning Page' };

    /**
     * @description Salesforce Id
     * @type {string}
     * @public
     */
    id;
    
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name;
    
    /**
     * @description Type of the Lightning Page
     * @type {string}
     * @public
     */
    type;
    
    /**
     * @description Name of the potential namespace/package where this item comes from. Empty string if none.
     * @type {string}
     * @public
     */
    package;
    
    /**
     * @description Date/Time when this item was created in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    createdDate;
    
    /**
     * @description Date/Time when this item was last modified in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastModifiedDate;

    /**
     * @description Identifier of the related object for this page (if any)
     * @type {string}
     * @public
     */
    objectId; 
    
    /**
     * @description Reference of the related object for this page (if any)
     * @type {SFDC_Object}
     * @public
     */
    objectRef;

    /**
     * @description Full description of that item
     * @type {string}
     * @public
     */
    description;
    
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url;
}

/**
 * @description Representation of a SObject Limit in Org Check
 */
class SFDC_Limit extends Data {
    
    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'SObject Limit' };

    /**
     * @description Salesforce Id
     * @type {string}
     * @public
     */
    id;
    
    /**
     * @description Label of this limit
     * @type {string}
     * @public
     */
    label;

    /**
     * @description Remaining count for this limit
     * @type {number}
     * @public
     */
    remaining;

    /**
     * @description Maximum count allowed for this limit
     * @type {number}
     * @public
     */
    max;

    /**
     * @description Currently used count for this limit
     * @type {number}
     * @public
     */
    used;

    /**
     * @description Percentage of used limit
     * @type {number}
     * @public
     */
    usedPercentage;

    /**
     * @description Technical name of that limit
     * @type {string}
     * @public
     */
    type;
}

class SFDC_ObjectRelationShip extends DataWithoutScoring {
    
    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'SObject Releationship' };

    /**
     * @description Name
     * @type {string}
     * @public
     */
    name;
    
    /**
     * @description Child object
     * @type {string}
     * @public
     */
    childObject;

    /**
     * @description Field that support the lookup in the parent object
     * @type {string}
     * @public
     */
    fieldName;

    /**
     * @description Is cascade delete enabled?
     * @type {boolean}
     * @public
     */
    isCascadeDelete;

    /**
     * @description Is restricted delete enabled?
     * @type {boolean}
     * @public
     */
    isRestrictedDelete;
}

class SFDC_ObjectType extends DataWithoutScoring {
    
    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'SObject Types' };

    /**
     * @description Technical representation of this type
     * @type {string}
     * @public
     */
    id;
    
    /**
     * @description Label of the type
     * @type {string}
     * @public
     */
    label;
}

const OBJECTTYPE_ID_STANDARD_SOBJECT = 'StandardEntity';
const OBJECTTYPE_ID_CUSTOM_SOBJECT = 'CustomObject';
const OBJECTTYPE_ID_CUSTOM_EXTERNAL_SOBJECT = 'ExternalObject';
const OBJECTTYPE_ID_CUSTOM_SETTING = 'CustomSetting';
const OBJECTTYPE_ID_CUSTOM_METADATA_TYPE = 'CustomMetadataType';
const OBJECTTYPE_ID_CUSTOM_EVENT = 'CustomEvent';
const OBJECTTYPE_ID_KNOWLEDGE_ARTICLE = 'KnowledgeArticle';
const OBJECTTYPE_ID_CUSTOM_BIG_OBJECT = 'CustomBigObject';

class SFDC_PageLayout extends Data {
    
    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Page Layout' };

    /**
     * @description Salesforce Id
     * @type {string}
     * @public
     */
    id;
    
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name;
    
    /**
     * @description Type of this item
     * @type {string}
     * @public
     */
    type;

    /**
     * @description Name of the potential namespace/package where this item comes from. Empty string if none.
     * @type {string}
     * @public
     */
    package;

    /**
     * @description Object Id of this page layout 
     * @type {string}
     * @public
     */
    objectId;

    /**
     * @description Object reference of this page layout 
     * @type {SFDC_Object}
     * @public
     */
    objectRef;

    /**
     * @description Number of profiles assigned to this page layout
     * @type {number}
     * @public
     */
    profileAssignmentCount;
    
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url;

    /**
     * @description Date/Time when this item was created in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    createdDate;
    
    /**
     * @description Date/Time when this item was last modified in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastModifiedDate;
}

class SFDC_RecordType extends Data {
    
    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Record Type' };

    /**
     * @description Salesforce Id
     * @type {string}
     * @public
     */
    id;
    
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name;
    
    /**
     * @description Developer Name
     * @type {string}
     * @public
     */
    developerName;
    
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url;

    /**
     * @description Is this item active or not?
     * @type {boolean}
     * @public
     */
    isActive;

    /**
     * @description Is this RT available?
     * @type {boolean}
     * @public
     */
    isAvailable;

    /**
     * @description Is this the default RT mapping?
     * @type {boolean}
     * @public
     */
    isDefaultRecordTypeMapping;

    /**
     * @description Is this the master record type?
     * @type {boolean}
     * @public
     */
    isMaster;
}

class SFDC_ValidationRule extends Data {
    
    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Validation Rule' };

    /**
     * @description Salesforce Id
     * @type {string}
     * @public
     */
    id;
    
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name;
    
    /**
     * @description Is this item active or not?
     * @type {boolean}
     * @public
     */
    isActive;
    
    /**
     * @description Full description of that item
     * @type {string}
     * @public
     */
    description;

    /**
     * @description Field where to show the error message if any
     * @type {string}
     * @public
     */
    errorDisplayField;

    /**
     * @description Error message
     * @type {string}
     * @public
     */
    errorMessage;
    
    /**
     * @description Salesforce Id of the sObject where this field is defined
     * @type {string}
     * @public
     */
    objectId; 

    /**
     * @description Reference of the object for this rule
     * @type {SFDC_Object}
     * @public
     */
    objectRef;

    /**
     * @description Name of the potential namespace/package where this item comes from. Empty string if none.
     * @type {string}
     * @public
     */
    package;

    /**
     * @description Date/Time when this item was created in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    createdDate;
    
    /**
     * @description Date/Time when this item was last modified in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastModifiedDate;

    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url;
}

class SFDC_WebLink extends Data {
    
    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Web Link' };

    /**
     * @description Salesforce Id
     * @type {string}
     * @public
     */
    id;
    
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name;

    /**
     * @description Unique list of hard coded Salesforce URLs in this item
     * @type {Array<string>}
     * @public
     */
    hardCodedURLs;

    /**
     * @description Unique list of hard coded Salesforce IDs in this item
     * @type {Array<string>}
     * @public
     */
    hardCodedIDs;
    
    /**
     * @description Type of the link
     * @type {string}
     * @public
     */
    type;
    
    /**
     * @description Behavior of the link
     * @type {string}
     * @public
     */
    behavior;

    /**
     * @description Name of the potential namespace/package where this item comes from. Empty string if none.
     * @type {string}
     * @public
     */
    package;

    /**
     * @description Date/Time when this item was created in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    createdDate;
    
    /**
     * @description Date/Time when this item was last modified in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastModifiedDate;
    
    /**
     * @description Full description of that item
     * @type {string}
     * @public
     */
    description;

    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url;
}

/**
 * @description Representation of as SObject in Org Check
 */
class SFDC_Object extends DataWithoutScoring {
    
    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'SObject' };

    /**
     * @description Salesforce Id
     * @type {string}
     * @public
     */
    id;
    
    /**
     * @description Label of this object
     * @type {string}
     * @public
     */
    label;

    /**
     * @description Plural label of this object
     * @type {string}
     * @public
     */
    labelPlural;

    /**
     * @description Whether this object is custom or not
     * @type {boolean}
     * @public
     */
    isCustom;
    
    /**
     * @description Whether this object has feed enabled or not
     * @type {boolean}
     * @public
     */
    isFeedEnabled;
    
    /**
     * @description Whether this object has MRU enabled or not
     * @type {boolean}
     * @public
     */
    isMostRecentEnabled;
    
    /**
     * @description Whether this object has search enabled or not
     * @type {boolean}
     * @public
     */
    isSearchable;
    
    /**
     * @description Prefix for this object (the three first digits of every record's salesforce id from this sobject)
     * @type {string}
     * @public
     */
    keyPrefix;
    
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name;
    
    /**
     * @description API name
     * @type {string}
     * @public
     */
    apiname;
    
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url;
    
    /**
     * @description Name of the potential namespace/package where this item comes from. Empty string if none.
     * @type {string}
     * @public
     */
    package;

    /**
     * @description Id of the type of this object
     * @type {string}
     * @public
     */
    typeId;

    /**
     * @description Reference of the type of this object
     * @type {SFDC_ObjectType}
     * @public
     */
    typeRef;
    
    /**
     * @description Full description of that item
     * @type {string}
     * @public
     */
    description;

    /**
     * @description External OWD 
     * @type {string}
     * @public
     */
    externalSharingModel;
    
    /**
     * @description Internal OWD 
     * @type {string}
     * @public
     */
    internalSharingModel;
    
    /**
     * @description List of Apex Triggers ids for this object
     * @type {Array<string>}
     * @public
     */
    apexTriggerIds;
    
    /**
     * @description Corresponding Apex Trigger references fot this object
     * @type {Array<SFDC_ApexTrigger>}
     * @public
     */
    apexTriggerRefs;
    
    /**
     * @description List of field Sets for this object
     * @type {Array<SFDC_FieldSet>}
     * @public
     */
    fieldSets;
    
    /**
     * @description List of layouts for this object
     * @type {Array<SFDC_PageLayout>}
     * @public
     */
    layouts;

    /**
     * @description List of Ligthning Pages for this object
     * @type {Array<SFDC_LightningPage>}
     * @public
     */
    flexiPages;
    
    /**
     * @description Limits for this object
     * @type {Array<SFDC_Limit>}
     * @public
     */
    limits;
    
    /**
     * @description List of validation rules for this object
     * @type {Array<SFDC_ValidationRule>}
     * @public
     */
    validationRules;
    
    /**
     * @description List of web links for this object
     * @type {Array<SFDC_WebLink>}
     * @public
     */
    webLinks;
    
    /**
     * @description List of standard fields for this object
     * @type {Array<SFDC_Field>}
     * @public
     */
    standardFields;
    
    /**
     * @description List of custom field Ids for this object
     * @type {Array<string>}
     * @public
     */
    customFieldIds;
    
    /**
     * @description List of custom field references for this object
     * @type {Array<SFDC_Field>}
     * @public
     */
    customFieldRefs;
    
    /**
     * @description List of record types for this object
     * @type {Array<SFDC_RecordType>}
     * @public
     */
    recordTypes;
    
    /**
     * @description List of relationships for this object
     * @type {Array<SFDC_ObjectRelationShip>}
     * @public
     */
    relationships;
    
    /**
     * @description Number of records for this object (including deleted ones)
     * @type {number}
     * @public
     */
    recordCount;
}

/**
 * @description Representation of an Apex Trigger in Org Check
 */
class SFDC_ApexTrigger extends DataWithDependencies {
    
    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Apex Trigger' };

    /**
     * @description Salesforce Id
     * @type {string}
     * @public
     */
    id;
    
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name;
    
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url;
    
    /**
     * @description API Version (as a number) set in the metadata for this item.
     * @type {number}
     * @public
     */
    apiVersion;
    
    /**
     * @description Name of the potential namespace/package where this item comes from. Empty string if none.
     * @type {string}
     * @public
     */
    package;

    /**
     * @description Number of characters used in the class (without comments)
     * @type {number}
     * @public
     */
    length;

    /**
     * @description Is this item active or not?
     * @type {boolean}
     * @public
     */
    isActive;
    
    /**
     * @description Is this trigger before insert or not?
     * @type {boolean}
     * @public
     */
    beforeInsert;
    
    /**
     * @description Is this trigger after insert or not?
     * @type {boolean}
     * @public
     */
    afterInsert;
    
    /**
     * @description Is this trigger before update or not?
     * @type {boolean}
     * @public
     */
    beforeUpdate;
    
    /**
     * @description Is this trigger after update or not?
     * @type {boolean}
     * @public
     */
    afterUpdate;
    
    /**
     * @description Is this trigger before delete or not?
     * @type {boolean}
     * @public
     */
    beforeDelete;
    
    /**
     * @description Is this trigger after delete or not?
     * @type {boolean}
     * @public
     */
    afterDelete;
    
    /**
     * @description Is this trigger after undelete or not?
     * @type {boolean}
     * @public
     */
    afterUndelete;
    
    /**
     * @description Identifier of the object for this trigger
     * @type {string}
     * @public
     */
    objectId; 
    
    /**
     * @description Reference of the object for this trigger
     * @type {SFDC_Object}
     * @public
     */
    objectRef;
    
    /**
     * @description Is this trigger containing SOQL statement?
     * @type {boolean}
     * @public
     */
    hasSOQL;
    
    /**
     * @description Is this trigger containing DML statement?
     * @type {boolean}
     * @public
     */
    hasDML;
    
    /**
     * @description Unique list of hard coded Salesforce URLs in this item
     * @type {Array<string>}
     * @public
     */
    hardCodedURLs;

    /**
     * @description Unique list of hard coded Salesforce IDs in this item
     * @type {Array<string>}
     * @public
     */
    hardCodedIDs;

    /**
     * @description Date/Time when this item was created in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    createdDate;
    
    /**
     * @description Date/Time when this item was last modified in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastModifiedDate;
}

/**
 * @description Representation of a Custom Label in Org Check
 */
class SFDC_CustomLabel extends DataWithDependencies {
    
    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Custom Label' };

    /**
     * @description Salesforce Id
     * @type {string}
     * @public
     */
    id;
    
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name;
    
    /**
     * @description Name of the potential namespace/package where this item comes from. Empty string if none.
     * @type {string}
     * @public
     */
    package;

    /**
     * @description Label
     * @type {string}
     * @public
     */
    label;

    /**
     * @description Category
     * @type {string}
     * @public
     */
    category;

    isProtected;

    /**
     * @description Language code for the label
     * @type {string}
     * @public
     */
    language;

    /**
     * @description Value
     * @type {string}
     * @public
     */
    value;
    
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url;
    
    /**
     * @description Date/Time when this item was created in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    createdDate;
    
    /**
     * @description Date/Time when this item was last modified in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastModifiedDate;
}

/**
 * Represents a Flow Definition and its Flow Version children
 */
class SFDC_Flow extends DataWithDependencies {
    
    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Flow or Process Builder' };

    /**
     * @description Salesforce Id
     * @type {string}
     * @public
     */
    id;
    
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name;
    
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url;
    
    /**
     * @description API Version (as a number) set in the metadata for this item.
     * @type {number}
     * @public
     */
    apiVersion;

    /**
     * @description Salesforce Id of the current flow version being used by this flow
     * @type {string}
     * @public
     */
    currentVersionId;
    
    /**
     * @description Reference of the current flow version being used by this flow
     * @type {SFDC_FlowVersion}
     * @public
     */
    currentVersionRef;
    
    /**
     * @description Is the current flow version of this flow is the latest version of this flow?
     * @type {boolean}
     * @public
     */
    isLatestCurrentVersion;
    
    /**
     * @description Is the version active?
     * @type {boolean}
     * @public
     */
    isVersionActive;
    
    /**
     * @description Count of versions for this flow
     * @type {number}
     * @public
     */
    versionsCount;
    
    /**
     * @description Full description of that item
     * @type {string}
     * @public
     */
    description;
    
    /**
     * @description Type of this flow
     * @type {string}
     * @public
     */
    type;
    
    /**
     * @description Is this a PB or not?
     * @type {boolean}
     * @public
     */
    isProcessBuilder;
    
    /**
     * @description Date/Time when this item was created in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    createdDate;
    
    /**
     * @description Date/Time when this item was last modified in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastModifiedDate;
}

/**
 * Represents a Flow Version
 */
class SFDC_FlowVersion extends DataWithoutScoring {
    
    /**
     * @description Salesforce Id
     * @type {string}
     * @public
     */
    id;
    
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name;
    
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url;
    version;
    
    /**
     * @description API Version (as a number) set in the metadata for this item.
     * @type {number}
     * @public
     */
    apiVersion;

    /**
     * @description Number of nodes in this flow version
     * @type {number}
     * @public
     */
    totalNodeCount;
    
    /**
     * @description Number of nodes in this flow version of DML Create type
     * @type {number}
     * @public
     */
    dmlCreateNodeCount;
    
    /**
     * @description Number of nodes in this flow version of DML Delete type
     * @type {number}
     * @public
     */
    dmlDeleteNodeCount;
    
    /**
     * @description Number of nodes in this flow version of DML Update type
     * @type {number}
     * @public
     */
    dmlUpdateNodeCount;
    
    /**
     * @description Number of nodes in this flow version of Screen type
     * @type {number}
     * @public
     */
    screenNodeCount;
    
    /**
     * @description Is this item active or not?
     * @type {boolean}
     * @public
     */
    isActive;
    
    /**
     * @description Full description of that item
     * @type {string}
     * @public
     */
    description;

    /**
     * @description Type of this item
     * @type {string}
     * @public
     */
    type;
    
    /**
     * @description Running mode of this flow version
     * @type {string}
     * @public
     */
    runningMode;
    
    /**
     * @description Date/Time when this item was created in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    createdDate;
    
    /**
     * @description Date/Time when this item was last modified in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastModifiedDate;
    
    /**
     * @description Name of the optional sobject this flow version is related to
     * @type {string}
     * @public
     */
    sobject;
    
    /**
     * @description Trigger type of this flow version (optional)
     * @type {string}
     * @public
     */
    triggerType;
}

class SFDC_Profile extends Data {
    
    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Profile' };

    /**
     * @description Salesforce Id
     * @type {string}
     * @public
     */
    id;
    
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url;
    
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name;
    
    /**
     * @description Full description of that item
     * @type {string}
     * @public
     */
    description;

    /**
     * @description License type of this item
     * @type {string}
     * @public
     */
    license;

    /**
     * @description Whether this item is a custom item
     * @type {boolean}
     * @public
     */
    isCustom;
    
    /**
     * @description Name of the potential namespace/package where this item comes from. Empty string if none.
     * @type {string}
     * @public
     */
    package;

    /**
     * @description Number of users assigned to this profile
     * @type {number}
     * @public
     */
    memberCounts;
    
    /**
     * @description Date/Time when this item was created in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    createdDate;
    
    /**
     * @description Date/Time when this item was last modified in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastModifiedDate;

    /**
     * @description Number of field permissions
     * @type {number}
     * @public
     */
    nbFieldPermissions;

    /**
     * @description Number of object permissions
     * @type {number}
     * @public
     */
    nbObjectPermissions;

    /**
     * @description Type of this item
     * @type {number}
     * @public
     */
    type;

    /**
     * @description Number of sensitive system permissions in this profile (like view all data etc..)
     * @type {any}
     * @public
     */
    importantPermissions;
}

class SFDC_PermissionSet extends SFDC_Profile {

    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Permission Set or Permission Set Group' };

    /**
     * @description Is this a Permission Set Group
     * @type {boolean}
     * @public
     */
    isGroup;

    /**
     * @description Corresponding Permission Set Group Salesforce Id, if this item is a Permission Set Group
     */
    groupId;
}

class SFDC_User extends Data {
    
    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'User' };

    /**
     * @description Salesforce Id
     * @type {string}
     * @public
     */
    id;
    
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url;
    
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name;
    
    /**
     * @description Datetime of the last login of that user. Undefined if never logged in.
     * @type {number}
     * @public
     */
    lastLogin;

    /**
     * @description Number of failed logins
     * @type {number}
     * @public
     */
    numberFailedLogins;
    
    /**
     * @description Is this user on the Lightning Experience?
     * @type {boolean}
     * @public
     */
    onLightningExperience;

    /**
     * @description When this user changed its password for the last time. Undefined if never changed.
     * @type {number}
     * @public
     */
    lastPasswordChange;

    /**
     * @description Profile salesforce id of this user
     * @type {string}
     * @public
     */
    profileId;

    /**
     * @description Crresponding Profile reference used by this user
     * @type {SFDC_Profile}
     * @public
     */
    profileRef;

    /**
     * @description List of sensible system permissions for this users (like view all etc.)
     * @type {any}
     * @public
     */
    aggregateImportantPermissions;

    /**
     * @description List of permission set ids assigned to this user
     * @type {Array<string>}
     * @public
     */
    permissionSetIds;

    /**
     * @description List of permission set references assigned to this user
     * @type {Array<SFDC_PermissionSet>}
     * @public
     */
    permissionSetRefs;
}

/**
 * @description Representation of a User Group in Org Check
 */
class SFDC_Group extends Data {
    
    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Public Group or Queue' };

    /**
     * @description Salesforce Id
     * @type {string}
     * @public
     */
    id;
    
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url;
    
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name;
    
    /**
     * @description Developer Name
     * @type {string}
     * @public
     */
    developerName;

    /**
     * @description Does it include bosses?
     * @type {boolean}
     * @public
     */
    includeBosses;

    /**
     * @description Does it include subordinates?
     * @type {boolean}
     * @public
     */
    includeSubordinates;

    /**
     * @description Salesfiorce Id of the related entity for this "box"
     * @public
     */
    relatedId;

    /**
     * @description Count of direct members (regardless if there are users or groups or roles etc.)
     * @type {number}
     * @public
     */
    nbDirectMembers;

    /**
     * @description List of direct user ids
     * @type {Array<string>}
     * @public
     */
    directUserIds;

    /**
     * @description List of direct user references
     * @type {Array<SFDC_User>}
     * @public
     */
    directUserRefs;

    /**
     * @description List of direct group ids
     * @type {Array<string>}
     * @public
     */
    directGroupIds;

    /**
     * @description List of direct group references
     * @type {Array<SFDC_Group>}
     * @public
     */
    directGroupRefs;

    /**
     * @description Is this a public group?
     * @type {boolean}
     * @public
     */
    isPublicGroup;

    /**
     * @description Is this a queue?
     * @type {boolean}
     * @public
     */
    isQueue;

    /**
     * @description Type of this item
     * @type {string}
     * @public
     */
    type;
}

/**
 * @description Representation of a Lightning Aura Component in Org Check
 */
class SFDC_LightningAuraComponent extends DataWithDependencies {
    
    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Aura Component' };

    /**
     * @description Salesforce Id
     * @type {string}
     * @public
     */
    id;
    
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name;
    
    /**
     * @description API Version (as a number) set in the metadata for this item.
     * @type {number}
     * @public
     */
    apiVersion;
    
    /**
     * @description Name of the potential namespace/package where this item comes from. Empty string if none.
     * @type {string}
     * @public
     */
    package;
    
    /**
     * @description Date/Time when this item was created in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    createdDate;
    
    /**
     * @description Date/Time when this item was last modified in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastModifiedDate;
    
    /**
     * @description Full description of that item
     * @type {string}
     * @public
     */
    description;
    
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url;
}

/**
 * @description Representation of a Lightning Web Component in Org Check
 */
class SFDC_LightningWebComponent extends DataWithDependencies {
    
    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Lightning Web Component' };

    /**
     * @description Salesforce Id
     * @type {string}
     * @public
     */
    id;
    
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name;
    
    /**
     * @description API Version (as a number) set in the metadata for this item.
     * @type {number}
     * @public
     */
    apiVersion;
    
    /**
     * @description Name of the potential namespace/package where this item comes from. Empty string if none.
     * @type {string}
     * @public
     */
    package;
    
    /**
     * @description Date/Time when this item was created in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    createdDate;
    
    /**
     * @description Date/Time when this item was last modified in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastModifiedDate;

    /**
     * @description Full description of that item
     * @type {string}
     * @public
     */
    description;    

    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url;
}

class SFDC_PermissionSetLicense extends Data {

    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Permission Set License' };

    /**
     * @description Salesforce Id of this item
     * @type {string}
     * @public
     */ 
    id;

    /**
     * @description Name
     * @type {string}
     * @public
     */
    name;

    /**
     * @description Total count of licenses
     * @type {number}
     * @public
     */
    totalCount;

    /**
     * @description Used count of licenses
     * @type {number}
     * @public
     */
    usedCount;

    /**
     * @description Percentage of used licenses
     * @type {number}
     * @public
     */
    usedPercentage;

    /**
     * @description Remaining count of licenses
     * @type {number}
     * @public
     */
    remainingCount;

    /**
     * @description Salesforce Id of the permission set associated with the current license
     * @type {Array<string>}
     * @public
     */
    permissionSetIds;

    /**
     * @description Corresponding references of the permission set associated with the current license
     * @type {Array<SFDC_PermissionSet>}
     * @public
     */
    permissionSetRefs;

    /**
     * @description Number of distinct users assigned to the permission set license
     * @type {number}
     * @public
     */
    distinctActiveAssigneeCount;

    /**
     * @description Status of the permission set license
     * @type {string}
     * @public
     */
    status;

    /**
     * @description Expiration date of the permission set license
     * @type {number}
     * @public
     */
    expirationDate;

    /**
     * @description Is the permission set license available for integrations
     * @type {boolean}
     * @public
     */
    isAvailableForIntegrations;

    /**
     * @description Created date of the permission set license
     * @type {number}
     * @public
     */
    createdDate;

    /**
     * @description Last modified date of the permission set license
     * @type {number}
     * @public
     */
    lastModifiedDate;

    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url;
}

class SFDC_ProfilePasswordPolicy extends Data {

    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Password Policy from a Profile' };

    /** 
     * @description The duration of the login lockout, in minutes. If users are locked out, they 
     *                  must wait until the lockout period expires. Valid values: 0, 15, 30, 60
     * @type {number}
     * @public
     */ 
    lockoutInterval;

    /**
     * @description The number of times a user can enter a wrong password before getting locked 
     *                  out. Valid values: 0, 3, 5, 10.
     * @type {number}
     * @public 
     */
    maxLoginAttempts;

    /**
     * @description Minimum number of characters required for a password. Valid values: 5–50.
     * @type {number}
     * @public 
     */
    minimumPasswordLength;

    /**
     * @description If true, a user cannot change a password more than once in a 24-hour period.
     * @type {boolean}
     * @public 
     */
    minimumPasswordLifetime;

    /**
     * @description If true, answers to security questions are hidden as the user types.
     * @type {boolean}
     * @public 
     */
    obscure;

    /**
     * @description Level of complexity required for the character types in a user’s password.
     *                  If 0, the password can contain any type of character.
     *                  If 1, the password must contain at least one alphabetic character and 1 number.
     *                  If 2, the password must contain at least one alphabetic character, one number, 
     *                      and one of the following special characters: ! # $ % - _ = + < >.
     *                  If 3, the password must contain at least one number, one uppercase letter, and 
     *                      one lowercase letter.
     *                  If 4, the password must contain at least one number, one uppercase letter, one 
     *                      lowercase letter, and one of the following special 
     *                      characters: ! # $ % - _ = + < >.
     * @type {number}
     * @public 
     */
    passwordComplexity;

    /**
     * @description Number of days until user passwords expire and must be changed. Valid values:
     *                  0 (If set to 0, the password never expires), 30, 60, 90, 180 or 365
     * @type {number}
     * @public 
     */
    passwordExpiration;

    /**
     * @description Number of previous passwords to save. Saving passwords is required to ensure 
     *                  that users reset their password to a new, unique password. This value must 
     *                  be set before a password reset succeeds. If 0, passwordExpiration must
     *                  be set to 0.
     * @type {number}
     * @public 
     */
    passwordHistory;

    /**
     * @description If set to true, the answer to the password hint cannot contain the password itself.
     *                  If false, the answer has no restrictions.
     * @type {boolean}
     * @public 
     */
    passwordQuestion;

    /**
     * @description Name of the associated user profile.
     * @type {string}
     * @public 
     */
    profileName;
}

class SFDC_ProfileRestrictions extends Data {

    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Restrictions from Profile' };

    /**
     * @description Salesforce Id of the corresponding Profile
     * @type {string}
     * @public
     */
    profileId;

    /**
     * @description Reference to the corresponding Profile
     * @type {SFDC_Profile}
     * @public
     */
    profileRef;

    /**
     * @description IP Range Restriction list for this profile
     * @type {Array<SFDC_ProfileIpRangeRestriction>}
     * @public
     */
    ipRanges;

    /**
     * @description Login Hour Restriction list for this profile
     * @type {Array<SFDC_ProfileLoginHourRestriction>}
     * @public
     */
    loginHours;
}

class SFDC_ProfileIpRangeRestriction extends DataWithoutScoring {

    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'IP Range Restriction from Profile' };

    /**
     * @description Start IP address
     * @type {string}
     * @public
     */
    startAddress;

    /**
     * @description End IP address
     * @type {string}
     * @public
     */
    endAddress;
    
    /**
     * @description Full description of that item
     * @type {string}
     * @public
     */
    description;

    /**
     * @description Number of IP addresses in this range (= end - start)
     * @type {number}
     * @public
     */
    difference;
}

class SFDC_ProfileLoginHourRestriction extends DataWithoutScoring {

    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Login Hour Restriction from Profile' };

    /**
     * @description Starting hour of the restriction (HH:MM format)
     * @type {string}
     * @public
     */
    fromTime;

    /**
     * @description Ending hour of the restriction (HH:MM format)
     * @type {string}
     * @public
     */
    toTime;

    /**
     * @description Label of the week day
     * @type {string}
     * @public
     */
    day;

    /**
     * @description Number of hours in this range (= toTime - fromTime)
     * @type {number}
     * @public
     */
    difference;
}

class SFDC_UserRole extends Data {

    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Role' };
    
    /**
     * @description Salesforce Id
     * @type {string}
     * @public
     */
    id;
    
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name;
    
    /**
     * @description API Name
     * @type {string}
     * @public
     */
    apiname;
    
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url;

    /**
     * @description Salesforce Id of the related parent Role
     * @type {string}
     * @public
     */
    parentId;

    /**
     * @description The related parent reference
     * @type {SFDC_UserRole}}
     * @public
     */
    parentRef;

    /**
     * @description Level of this role in the global role hierarchy
     * @type {number}
     * @public
     */
    level;
    
    /**
     * @description Is this role a parent?
     * @type {boolean}
     * @public
     */
    hasParent;
    
    /**
     * @description Number of active members in this role
     * @type {number}
     * @public
     */
    activeMembersCount;
    
    /** 
     * @description Array of active member user ids
     * @type {Array<string>}
     * @public
     */
    activeMemberIds;
    
    /**
     * @description Array of active member user references
     * @type {Array<SFDC_User>}
     * @public
     */
    activeMemberRefs;
    
    /**
     * @description Does this role have active members?
     * @type {boolean}
     * @public
     */
    hasActiveMembers;
}

class SFDC_VisualForceComponent extends DataWithDependencies {
    
    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Visualforce Component' };

    /**
     * @description Salesforce Id
     * @type {string}
     * @public
     */
    id;
    
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name;
    
    /**
     * @description API Version (as a number) set in the metadata for this item.
     * @type {number}
     * @public
     */
    apiVersion;

    /**
     * @description Unique list of hard coded Salesforce URLs in this item
     * @type {Array<string>}
     * @public
     */
    hardCodedURLs;

    /**
     * @description Unique list of hard coded Salesforce IDs in this item
     * @type {Array<string>}
     * @public
     */
    hardCodedIDs;
        
    /**
     * @description Name of the potential namespace/package where this item comes from. Empty string if none.
     * @type {string}
     * @public
     */
    package;
    
    /**
     * @description Date/Time when this item was created in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    createdDate;
    
    /**
     * @description Date/Time when this item was last modified in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastModifiedDate;
    
    /**
     * @description Full description of that item
     * @type {string}
     * @public
     */
    description;
    
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url;
}

class SFDC_VisualForcePage extends DataWithDependencies {
    
    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Visualforce Page' };

    /**
     * @description Salesforce Id
     * @type {string}
     * @public
     */
    id;
    
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name;
    
    /**
     * @description API Version (as a number) set in the metadata for this item.
     * @type {number}
     * @public
     */
    apiVersion;

    /**
     * @description Unique list of hard coded Salesforce URLs in this item
     * @type {Array<string>}
     * @public
     */
    hardCodedURLs;

    /**
     * @description Unique list of hard coded Salesforce IDs in this item
     * @type {Array<string>}
     * @public
     */
    hardCodedIDs;

    /**
     * @description Is this page ready for mobile?
     * @type {boolean}
     * @public
     */ 
    isMobileReady;
    
    /**
     * @description Name of the potential namespace/package where this item comes from. Empty string if none.
     * @type {string}
     * @public
     */
    package;
    
    /**
     * @description Date/Time when this item was created in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    createdDate;
    
    /**
     * @description Date/Time when this item was last modified in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastModifiedDate;
    
    /**
     * @description Full description of that item
     * @type {string}
     * @public
     */
    description;
    
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url;
}

class SFDC_Workflow extends Data {
    
    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Workflow' };

    /**
     * @description Salesforce Id
     * @type {string}
     * @public
     */
    id;
    
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name;
    
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url;
    
    /**
     * @description Full description of that item
     * @type {string}
     * @public
     */
    description;

    /**
     * @description Direct actions associated with this item
     * @type {Array<any>}
     * @public
     */
    actions;

    /**
     * @description Future actions associated with this item
     * @type {Array<any>}
     * @public
     */
    futureActions;

    /**
     * @description Empty time triggers associated with this item
     * @type {Array<any>}
     * @public
     */
    emptyTimeTriggers;

    /**
     * @description Is this item active or not?
     * @type {boolean}
     * @public
     */
    isActive;
    
    /**
     * @description Date/Time when this item was created in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    createdDate;
    
    /**
     * @description Date/Time when this item was last modified in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastModifiedDate;

    /**
     * @description True if this item has at least one action associated with it
     * @type {boolean}
     * @public
     */
    hasAction;
}

/**
 * @description Checks if the difference bewteen the given current version and the api version is more than three years (or more if specified)
 * @param {any} currentVersion set for a specific item like VFP, apex class, etc.
 * @param {any} version used by the api (should be the latest)
 * @param {number} [definition_of_old=3] Definition of "old" in years (three years by default)
 * @returns true if the given current version is said too old, false otherwise.
 * @private
 */
const IS_OLD_APIVERSION = (currentVersion, version, definition_of_old = 3) => { 
    if (version && currentVersion && definition_of_old) return ((currentVersion - version) / 3) >= definition_of_old; 
    return false;
};

/**
 * @description Checks if a given value is "empty". The value can be a string or an Array.
 * @param {Array | string} value
 * @returns true if the value is empty. false otherwise
 * @private
 */
const IS_EMPTY = (value) => {
    // In case we have a numerial value as input
    if (typeof value === 'number' && value === 0) return false;
    // if the value is undefined or null --> it's EMPTY!
    if (!value) return true;
    // length is a property both used in Array and string. Obviously if the length is zero --> it's EMPTY!
    if (value.length === 0) return true;
    // sometimes a string contains only spaces and we want to consider this as empty as well.
    // only if the value is a string, use trim() to get rid of the spaces on the left and right, and check the final length
    if (typeof value === 'string' && value.trim().length === 0) return true;
    // return false otherwise.
    return false;
};

/**
 * @description Get the latest API version a Salesforce org can handle (exception for sandboxes that are in preview mode)
 * @returns {number}
 * @private
 */ 
const GET_LATEST_API_VERSION = () => {
    const TODAY = new Date();
    const THIS_YEAR = TODAY.getFullYear();
    const THIS_MONTH = TODAY.getMonth()+1;
    return 3*(THIS_YEAR-2022)+53+(THIS_MONTH<=2?0:(THIS_MONTH<=6?1:(THIS_MONTH<=10?2:3)));
};

/**
 * @description List of score rules
 * @type {Array<ScoreRule>}
 * @private
 */
const ALL_SCORE_RULES = [
    // IMPORTANT NOTE:
    // ScoreRule ids are explicitly hard coded in the following list. 
    // This is by choice and design. ;)
    // Why? To make sure from one version to the other, the same rule id is not used for another rule...
    // So please continue to increment IDs values and ADD NEW RULES AT THE END of the array !!
    { 
        id: 0,
        description: 'Not referenced anywhere',
        formula: (/** @type {SFDC_CustomLabel | SFDC_Flow | SFDC_LightningPage | SFDC_LightningAuraComponent | SFDC_LightningWebComponent | SFDC_VisualForceComponent | SFDC_VisualForcePage} */ d) => d.dependencies?.hadError === false && IS_EMPTY(d.dependencies?.referenced), 
        errorMessage: 'This component is not referenced anywhere (as we were told by the Dependency API). Please review the need to keep it in your org.',
        badField: 'dependencies.referenced.length',
        applicable: [ SFDC_CustomLabel, SFDC_Flow, SFDC_LightningPage, SFDC_LightningAuraComponent, SFDC_LightningWebComponent, SFDC_VisualForceComponent, SFDC_VisualForcePage ]
    }, {
        id: 1,
        description: 'No reference anywhere for custom field',
        formula: (/** @type {SFDC_Field} */ d) => d.isCustom === true && d.dependencies?.hadError === false && IS_EMPTY(d.dependencies?.referenced), 
        errorMessage: 'This custom field is not referenced anywhere (as we were told by the Dependency API). Please review the need to keep it in your org.',
        badField: 'dependencies.referenced.length',
        applicable: [ SFDC_Field ]
    }, {
        id: 2,
        description: 'No reference anywhere for apex class',
        formula: (/** @type {SFDC_ApexClass} */ d) => d.isTest === false && d.dependencies?.hadError === false && IS_EMPTY(d.dependencies?.referenced), 
        errorMessage: 'This apex class is not referenced anywhere (as we were told by the Dependency API). Please review the need to keep it in your org.',
        badField: 'dependencies.referenced.length',
        applicable: [ SFDC_ApexClass ]
    }, {
        id: 3,
        description: 'Sorry, we had an issue with the Dependency API to gather the dependencies of this item',
        formula: (/** @type {DataWithDependencies} */ d) => d.dependencies && d.dependencies.hadError === true, 
        errorMessage: 'Sorry, we had an issue with the Dependency API to gather the dependencies of this item.',
        badField: 'dependencies.referenced.length',
        applicable: [ SFDC_Field, SFDC_ApexClass, SFDC_CustomLabel, SFDC_Flow, SFDC_LightningPage, SFDC_LightningAuraComponent, SFDC_LightningWebComponent, SFDC_VisualForceComponent, SFDC_VisualForcePage ]
    }, {
        id: 4,
        description: 'API Version too old',
        formula: (/** @type {SFDC_ApexClass | SFDC_ApexTrigger | SFDC_Flow | SFDC_LightningAuraComponent | SFDC_LightningWebComponent | SFDC_VisualForcePage | SFDC_VisualForceComponent} */ d) => IS_OLD_APIVERSION(SecretSauce.CurrentApiVersion, d.apiVersion),
        errorMessage: 'The API version of this component is too old. Please update it to a newest version.',
        badField: 'apiVersion',
        applicable: [ SFDC_ApexClass, SFDC_ApexTrigger, SFDC_Flow, SFDC_LightningAuraComponent, SFDC_LightningWebComponent, SFDC_VisualForcePage, SFDC_VisualForceComponent ]
    }, {
        id: 5,
        description: 'No assert in this Apex Test',
        formula: (/** @type {SFDC_ApexClass} */ d) => d.isTest === true && d.nbSystemAsserts === 0,
        errorMessage: 'This apex test does not contain any assert! Best practices force you to define asserts in tests.',
        badField: 'nbSystemAsserts',
        applicable: [ SFDC_ApexClass ]
    }, {
        id: 6,
        description: 'No description',
        formula: (/** @type {SFDC_Flow | SFDC_LightningPage | SFDC_LightningAuraComponent | SFDC_LightningWebComponent | SFDC_VisualForcePage | SFDC_VisualForceComponent | SFDC_Workflow | SFDC_WebLink | SFDC_FieldSet | SFDC_ValidationRule} */ d) => IS_EMPTY(d.description),
        errorMessage: 'This component does not have a description. Best practices force you to use the Description field to give some informative context about why and how it is used/set/govern.',
        badField: 'description',
        applicable: [ SFDC_Flow, SFDC_LightningPage, SFDC_LightningAuraComponent, SFDC_LightningWebComponent, SFDC_VisualForcePage, SFDC_VisualForceComponent, SFDC_Workflow, SFDC_WebLink, SFDC_FieldSet, SFDC_ValidationRule ]
    }, {
        id: 7,
        description: 'No description for custom component',
        formula: (/** @type {SFDC_Field | SFDC_PermissionSet | SFDC_Profile} */ d) => d.isCustom === true && IS_EMPTY(d.description),
        errorMessage: 'This custom component does not have a description. Best practices force you to use the Description field to give some informative context about why and how it is used/set/govern.',
        badField: 'description',
        applicable: [ SFDC_Field, SFDC_PermissionSet, SFDC_Profile ]
    }, {
        id: 8,
        description: 'No explicit sharing in apex class',
        formula: (/** @type {SFDC_ApexClass} */ d) => d.isTest === false && d.isClass === true && !d.specifiedSharing,
        errorMessage: 'This Apex Class does not specify a sharing model. Best practices force you to specify with, without or inherit sharing to better control the visibility of the data you process in Apex.',
        badField: 'specifiedSharing',
        applicable: [ SFDC_ApexClass ]
    }, {
        id: 9,
        description: 'Schedulable should be scheduled',
        formula: (/** @type {SFDC_ApexClass} */ d) => d.isScheduled === false && d.isSchedulable === true,
        errorMessage: 'This Apex Class implements Schedulable but is not scheduled. What is the point? Is this class still necessary?',
        badField: 'isScheduled',
        applicable: [ SFDC_ApexClass ]
    }, {
        id: 10,
        description: 'Not able to compile class',
        formula: (/** @type {SFDC_ApexClass} */ d) => d.needsRecompilation === true,
        errorMessage: 'This Apex Class can not be compiled for some reason. You should try to recompile it. If the issue remains you need to consider refactorying this class or the classes that it is using.',
        badField: 'name',
        applicable: [ SFDC_ApexClass ]
    }, {
        id: 11,
        description: 'No coverage for this class',
        formula: (/** @type {SFDC_ApexClass} */ d) => d.isTest === false && (isNaN(d.coverage) || !d.coverage),
        errorMessage: 'This Apex Class does not have any code coverage. Consider launching the corresponding tests that will bring some coverage. If you do not know which test to launch just run them all!',
        badField: 'coverage',
        applicable: [ SFDC_ApexClass ]
    }, {
        id: 12,
        description: 'Coverage not enough',
        formula: (/** @type {SFDC_ApexClass} */ d) => d.coverage > 0 && d.coverage < 0.75,
        errorMessage: 'This Apex Class does not have enough code coverage (less than 75% of lines are covered by successful unit tests). Maybe you ran not all the unit tests to cover this class entirely? If you did, then consider augmenting that coverage with new test methods.',
        badField: 'coverage',
        applicable: [ SFDC_ApexClass ]
    }, {
        id: 13,
        description: 'At least one testing method failed',
        formula: (/** @type {SFDC_ApexClass} */ d) => d.isTest === true && d.testFailedMethods && d.testFailedMethods.length > 0,
        errorMessage: 'This Apex Test Class has at least one failed method.',
        badField: 'testFailedMethods',
        applicable: [ SFDC_ApexClass ]
    }, {
        id: 14,
        description: 'Apex trigger should not contain SOQL statement',
        formula: (/** @type {SFDC_ApexTrigger} */ d) => d.hasSOQL === true,
        errorMessage: 'This Apex Trigger contains at least one SOQL statement. Best practices force you to move any SOQL statement in dedicated Apex Classes that you would call from the trigger. Please update the code accordingly.',
        badField: 'hasSOQL',
        applicable: [ SFDC_ApexTrigger ]
    }, {
        id: 15,
        description: 'Apex trigger should not contain DML action',
        formula: (/** @type {SFDC_ApexTrigger} */ d) => d.hasDML === true,
        errorMessage: 'This Apex Trigger contains at least one DML action. Best practices force you to move any DML action in dedicated Apex Classes that you would call from the trigger. Please update the code accordingly.',
        badField: 'hasDML',
        applicable: [ SFDC_ApexTrigger ]
    }, {
        id: 16,
        description: 'Apex Trigger should not contain logic',
        formula: (/** @type {SFDC_ApexTrigger} */ d) => d.length > 5000,
        errorMessage: 'Due to the massive number of source code (more than 5000 characters) in this Apex Trigger, we suspect that it contains logic. Best practices force you to move any logic in dedicated Apex Classes that you would call from the trigger. Please update the code accordingly.',
        badField: 'length',
        applicable: [ SFDC_ApexTrigger ]
    }, {
        id: 17,
        description: 'No direct member for this group',
        formula: (/** @type {SFDC_Group} */ d) => !d.nbDirectMembers || d.nbDirectMembers === 0,
        errorMessage: 'This public group (or queue) does not contain any direct members (users or sub groups). Is it empty on purpose? Maybe you should review its use in your org...',
        badField: 'nbDirectMembers',
        applicable: [ SFDC_Group ]
    }, {
        id: 18,
        description: 'Custom permset or profile with no member',
        formula: (/** @type {SFDC_PermissionSet | SFDC_Profile} */ d) => d.isCustom === true && d.memberCounts === 0,
        errorMessage: 'This custom permission set (or custom profile) has no members. Is it empty on purpose? Maybe you should review its use in your org...',
        badField: 'memberCounts',
        applicable: [ SFDC_PermissionSet, SFDC_Profile ]
    }, {
        id: 19,
        description: 'Role with no active users',
        formula: (/** @type {SFDC_UserRole} */ d) => d.activeMembersCount === 0,
        errorMessage: 'This role has no active users assigned to it. Is it on purpose? Maybe you should review its use in your org...',
        badField: 'activeMembersCount',
        applicable: [ SFDC_UserRole ]
    }, {
        id: 20,
        description: 'Active user not under LEX',
        formula: (/** @type {SFDC_User} */ d) => d.onLightningExperience === false,
        errorMessage: 'This user is still using Classic. Time to switch to Lightning for all your users, don\'t you think?',
        badField: 'onLightningExperience',
        applicable: [ SFDC_User ]
    }, {
        id: 21,
        description: 'Active user never logged',
        formula: (/** @type {SFDC_User} */ d) => d.lastLogin === null,
        errorMessage: 'This active user never logged yet. Time to optimize your licence cost!',
        badField: 'lastLogin',
        applicable: [ SFDC_User ]
    }, {
        id: 22,
        description: 'Workflow with no action',
        formula: (/** @type {SFDC_Workflow} */ d) => d.hasAction === false,
        errorMessage: 'This workflow has no action, please review it and potentially remove it.',
        badField: 'hasAction',
        applicable: [ SFDC_Workflow ]
    }, {
        id: 23,
        description: 'Workflow with empty time triggered list',
        formula: (/** @type {SFDC_Workflow} */ d) => d.emptyTimeTriggers.length > 0,
        errorMessage: 'This workflow is time triggered but with no time triggered action, please review it.',
        badField: 'emptyTimeTriggers',
        applicable: [ SFDC_Workflow ]
    }, {
        id: 24,
        description: 'Password policy with question containing password!',
        formula: (/** @type {SFDC_ProfilePasswordPolicy} */ d) => d.passwordQuestion === true,
        errorMessage: 'This profile password policy allows to have password in the question! Please change that setting as it is clearly a lack of security in your org!',
        badField: 'passwordQuestion',
        applicable: [ SFDC_ProfilePasswordPolicy ]
    }, {
        id: 25,
        description: 'Password policy with too big expiration',
        formula: (/** @type {SFDC_ProfilePasswordPolicy} */ d) => d.passwordExpiration > 90,
        errorMessage: 'This profile password policy allows to have password that expires after 90 days. Please consider having a shorter period of time for expiration if you policy.',
        badField: 'passwordExpiration',
        applicable: [ SFDC_ProfilePasswordPolicy ]
    }, {
        id: 26,
        description: 'Password policy with no expiration',
        formula: (/** @type {SFDC_ProfilePasswordPolicy} */ d) => d.passwordExpiration === 0,
        errorMessage: 'This profile password policy allows to have password that never expires. Why is that? Do you have this profile for technical users? Please reconsider this setting and use JWT authentication instead for technical users.',
        badField: 'passwordExpiration',
        applicable: [ SFDC_ProfilePasswordPolicy ]
    }, {
        id: 27,
        description: 'Password history too small',
        formula: (/** @type {SFDC_ProfilePasswordPolicy} */ d) => d.passwordHistory < 3,
        errorMessage: 'This profile password policy allows users to set their password with a too-short memory. For example, they can keep on using the same different password everytime you ask them to change it. Please increase this setting.',
        badField: 'passwordHistory',
        applicable: [ SFDC_ProfilePasswordPolicy ]
    }, {
        id: 28,
        description: 'Password minimum size too small',
        formula: (/** @type {SFDC_ProfilePasswordPolicy} */ d) => d.minimumPasswordLength < 8,
        errorMessage: 'This profile password policy allows users to set passwords with less than 8 charcaters. That minimum length is not strong enough. Please increase this setting.',
        badField: 'minimumPasswordLength',
        applicable: [ SFDC_ProfilePasswordPolicy ]
    }, {
        id: 29,
        description: 'Password complexity too weak',
        formula: (/** @type {SFDC_ProfilePasswordPolicy} */ d) => d.passwordComplexity < 3,
        errorMessage: 'This profile password policy allows users to set too-easy passwords. The complexity you choose is not storng enough. Please increase this setting.',
        badField: 'passwordComplexity',
        applicable: [ SFDC_ProfilePasswordPolicy ]
    }, {
        id: 30,
        description: 'No max login attempts set',
        formula: (/** @type {SFDC_ProfilePasswordPolicy} */ d) => d.maxLoginAttempts === undefined,
        errorMessage: 'This profile password policy allows users to try infinitely to log in without locking the access. Please review this setting.',
        badField: 'passwordExpiration',
        applicable: [ SFDC_ProfilePasswordPolicy ]
    }, {
        id: 31,
        description: 'No lockout period set',
        formula: (/** @type {SFDC_ProfilePasswordPolicy} */ d) => d.lockoutInterval === undefined,
        errorMessage: 'This profile password policy does not set a value for any locked out period. Please review this setting.',
        badField: 'lockoutInterval',
        applicable: [ SFDC_ProfilePasswordPolicy ]
    }, {
        id: 32,
        description: 'IP Range too large',
        formula: (/** @type {SFDC_ProfileRestrictions} */ d) => d.ipRanges.filter(i => i.difference > 100000).length > 0,
        errorMessage: 'This profile includes an IP range that is to wide (more than 100.000 IP addresses!). If you set an IP Range it should be not that large. You could split that range into multiple ones. The risk is that you include an IP that is not part of your company. Please review this setting.',
        badField: 'ipRanges',
        applicable: [ SFDC_ProfileRestrictions ]
    }, {
        id: 33,
        description: 'Login hours too large',
        formula: (/** @type {SFDC_ProfileRestrictions} */ d) => d.loginHours.filter(i => i.difference > 1200).length > 0,
        errorMessage: 'This profile includes a login hour that is to wide (more than 20 hours a day!). If you set a login hour it should reflect the reality. Please review this setting.',
        badField: 'loginHours',
        applicable: [ SFDC_ProfileRestrictions ]
    }, {
        id: 34,
        description: 'Inactive component',
        formula: (/** @type {SFDC_ValidationRule | SFDC_RecordType | SFDC_ApexTrigger | SFDC_Workflow} */ d) => d.isActive === false,
        errorMessage: 'This component is inactive, so why do not you just remove it from your org?',
        badField: 'isActive',
        applicable: [ SFDC_ValidationRule, SFDC_RecordType, SFDC_ApexTrigger, SFDC_Workflow ]
    }, {
        id: 35,
        description: 'No active version for this flow',
        formula: (/** @type {SFDC_Flow} */ d) => d.isVersionActive === false,
        errorMessage: 'This flow does not have an active version, did you forgot to activate its latest version? or you do not need that flow anymore?',
        badField: 'isVersionActive',
        applicable: [ SFDC_Flow ]
    }, {
        id: 36,
        description: 'Too many versions under this flow',
        formula: (/** @type {SFDC_Flow} */ d) => d.versionsCount > 7,
        errorMessage: 'This flow has more than seven versions. Maybe it is time to do some cleaning in this flow!',
        badField: 'versionsCount',
        applicable: [ SFDC_Flow ]
    }, {
        id: 37,
        description: 'Migrate this process builder',
        formula: (/** @type {SFDC_Flow} */ d) => d.currentVersionRef?.type === 'Workflow',
        errorMessage: 'Time to migrate this process builder to flow!',
        badField: 'name',
        applicable: [ SFDC_Flow ]
    }, {
        id: 38,
        description: 'No description for the current version of a flow',
        formula: (/** @type {SFDC_Flow} */ d) => IS_EMPTY(d.currentVersionRef?.description),
        errorMessage: `This flow's current version does not have a description. Best practices force you to use the Description field to give some informative context about why and how it is used/set/govern.`,
        badField: 'currentVersionRef.description',
        applicable: [ SFDC_Flow ]
    }, {
        id: 39,
        description: 'API Version too old for the current version of a flow',
        formula: (/** @type {SFDC_Flow} */ d) => IS_OLD_APIVERSION(SecretSauce.CurrentApiVersion, d.currentVersionRef?.apiVersion),
        errorMessage: `The API version of this flow's current version is too old. Please update it to a newest version.`,
        badField: 'currentVersionRef.apiVersion',
        applicable: [ SFDC_Flow ]
    }, {
        id: 40,
        description: 'This flow is running without sharing',
        formula: (/** @type {SFDC_Flow} */ d) => d.currentVersionRef?.runningMode === 'SystemModeWithoutSharing',
        errorMessage: `The running mode of this version without sharing. With great power comes great responsabilities. Please check if this is REALLY needed.`,
        badField: 'currentVersionRef.runningMode',
        applicable: [ SFDC_Flow ]
    }, {
        id: 41,
        description: 'Too many nodes in this version',
        formula: (/** @type {SFDC_Flow} */ d) => d.currentVersionRef?.totalNodeCount > 100,
        errorMessage: `There are more than one hundred of nodes in this flow. Please consider using Apex? or cut it into multiple sub flows?`,
        badField: 'currentVersionRef.totalNodeCount',
        applicable: [ SFDC_Flow ]
    }, {
        id: 42,
        description: 'Near the limit',
        formula: (/** @type {SFDC_Limit} */ d) => d.usedPercentage >= 0.80,
        errorMessage: 'This limit is almost reached (>80%). Please review this.',
        badField: 'usedPercentage',
        applicable: [ SFDC_Limit ]
    }, {
        id: 43,
        description: 'Almost all licenses are used',
        formula: (/** @type {SFDC_PermissionSetLicense} */ d) => d.usedPercentage !== undefined && d.usedPercentage >= 0.80,
        errorMessage: 'The number of seats for this license is almost reached (>80%). Please review this.',
        badField: 'usedPercentage',
        applicable: [ SFDC_PermissionSetLicense ]
    }, {
        id: 44,
        description: 'You could have licenses to free up',
        formula: (/** @type {SFDC_PermissionSetLicense} */ d) => d.remainingCount > 0 && d.distinctActiveAssigneeCount !==  d.usedCount,
        errorMessage: 'The Used count from that permission set license does not match the number of disctinct active user assigned to the same license. Please check if you could free up some licenses!',
        badField: 'distinctActiveAssigneeCount',
        applicable: [ SFDC_PermissionSetLicense ]
    }, {
        id: 45,
        description: 'Role with a level >= 7',
        formula: (/** @type {SFDC_UserRole} */ d) => d.level >= 7,
        errorMessage: 'This role has a level in the Role Hierarchy which is seven or greater. Please reduce the maximum depth of the role hierarchy. Having that much levels has an impact on performance...',
        badField: 'level',
        applicable: [ SFDC_UserRole ]
    }, {
        id: 46,
        description: 'Hard-coded URL suspicion in this item',
        formula: (/** @type {SFDC_ApexClass | SFDC_ApexTrigger | SFDC_Field | SFDC_VisualForceComponent | SFDC_VisualForcePage | SFDC_WebLink} */ d) => d.hardCodedURLs?.length > 0 || false,
        errorMessage: 'The source code of this item contains one or more hard coded URLs pointing to domains like salesforce.com or force.*',
        badField: 'hardCodedURLs',
        applicable: [ SFDC_ApexClass, SFDC_ApexTrigger, SFDC_Field, SFDC_VisualForceComponent, SFDC_VisualForcePage, SFDC_WebLink ]
    }, {
        id: 47,
        description: 'Hard-coded Salesforce IDs suspicion in this item',
        formula: (/** @type {SFDC_ApexClass | SFDC_ApexTrigger | SFDC_Field | SFDC_VisualForceComponent | SFDC_VisualForcePage | SFDC_WebLink} */ d) => d.hardCodedIDs?.length > 0 || false,
        errorMessage: 'The source code of this item contains one or more hard coded Salesforce IDs',
        badField: 'hardCodedIDs',
        applicable: [ SFDC_ApexClass, SFDC_ApexTrigger, SFDC_Field, SFDC_VisualForceComponent, SFDC_VisualForcePage, SFDC_WebLink ]
    }, {
        id: 48,
        description: 'At least one successful testing method was very long',
        formula: (/** @type {SFDC_ApexClass} */ d) => d.isTest === true && d.testPassedButLongMethods && d.testPassedButLongMethods.length > 0,
        errorMessage: 'This Apex Test Class has at least one successful method which took more than 20 secondes to execute',
        badField: 'testPassedButLongMethods',
        applicable: [ SFDC_ApexClass ]
    }, {
        id: 49,
        description: 'Page layout should be assigned to at least one Profile',
        formula: (/** @type {SFDC_PageLayout} */ d) => d.profileAssignmentCount === 0,
        errorMessage: 'This Page Layout is not assigned to any Profile. Please review this page layout and assign it to at least one profile.',
        badField: 'profileAssignmentCount',
        applicable: [ SFDC_PageLayout ]
    }
];

/**
 * @description Map used to get a rule direclty from its ID (we don't want to expose the map)
 * @type {Map<number, ScoreRule>}
 * @private
 */
const ALL_SCORE_RULES_AS_MAP = new Map(ALL_SCORE_RULES.map(i => [ i.id, i ]));

/**
 * @description In Org Check, there are two main ingredients for our secret sauce: the score rules and the current api version of an org. Of course this secret sauce object is unmutable.
 * @property {Array<ScoreRule>} AllScoreRules
 * @property {Map<number, ScoreRule>} AllScoreRulesById
 * @property {number} CurrentApiVersion
 * @public
 */
const SecretSauce = {
    AllScoreRules: ALL_SCORE_RULES,
    GetScoreRule: (/** @type {number} */ id) => ALL_SCORE_RULES_AS_MAP.get(id),
    GetScoreRuleDescription: (/** @type {number} */ id) => ALL_SCORE_RULES_AS_MAP.get(id).description,
    CurrentApiVersion: GET_LATEST_API_VERSION()
};
Object.freeze(SecretSauce);

/**
 * @description Representation of an Application in Org Check
 */
class SFDC_Application extends DataWithoutScoring {
    
    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Application' };

    /**
     * @description Salesforce Id of the application
     * @type {string}
     * @public
     */
    id;
    
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name;
    
    /**
     * @description Label
     * @type {string}
     * @public
     */
    label;
    
    /**
     * @description Name of the potential namespace/package where this item comes from. Empty string if none.
     * @type {string}
     * @public
     */
    package;
}

/**
 * @description Representation of an Application permission for a specific parent (profile or permission set) in Org Check
 */
class SFDC_AppPermission extends DataWithoutScoring {
    
    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Application Permission from Profile or Permission Set' };

    /**
     * @description Salesforce Id of the related parent (profile or permission set)
     * @type {string}
     * @public
     */
    parentId;
    
    /**
     * @description Reference of the related parent
     * @type {SFDC_Profile | SFDC_PermissionSet}
     * @public
     */
    parentRef;
    
    /**
     * @description Salesforce Id of the application
     * @type {string}
     * @public
     */
    appId;
    
    /**
     * @description Reference of the related application
     * @type {SFDC_Application}
     * @public
     */
    appRef;

    /**
     * @description Permission for this related parent to access this app?
     * @type {boolean}
     * @public
     */
    isAccessible;
    
    /**
     * @description Permission for this related parent to see this app?
     * @type {boolean}
     * @public
     */
    isVisible;
}

/**
 * @description Representation of an Application permission for a specific parent (profile or permission set) in Org Check
 */
class SFDC_FieldPermission extends DataWithoutScoring {
    
    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Field Level Security from Profile or Permission Set' };

    /**
     * @description Salesforce Id of the related parent (profile or permission set)
     * @type {string}
     * @public
     */
    parentId;
    
    /**
     * @description Reference of the related parent
     * @type {SFDC_Profile | SFDC_PermissionSet}
     * @public
     */
    parentRef;
    
    /**
     * @description Api name Id of the field (along with the object)
     * @type {string}
     * @public
     */
    fieldApiName;

    /**
     * @description Permission for this related parent to read this field?
     * @type {boolean}
     * @public
     */
    isRead;
    
    /**
     * @description Permission for this related parent to update this field?
     * @type {boolean}
     * @public
     */
    isEdit;
}

/**
 * @description Representation of a SObject permissions (CRUD) for a specific parent (profile or permission set) in Org Check
 */
class SFDC_ObjectPermission extends Data {

    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Object Permissions from Profile or Permission Set' };

    /**
     * @description Salesforce Id of the related parent (profile or permission set)
     * @type {string}
     * @public
     */
    parentId;
    
    /**
     * @description Reference of the related parent
     * @type {SFDC_Profile | SFDC_PermissionSet}
     * @public
     */
    parentRef;
    
    /** 
     * @description The object’s API name. For example, Merchandise__c
     * @type {string}
     * @public
     */
    objectType;

    /**
     * @description Right to read?
     * @type {boolean}
     * @public
     */
    isRead;

    /**
     * @description Right to create?
     * @type {boolean}
     * @public
     */
    isCreate;

    /**
     * @description Right to update?
     * @type {boolean}
     * @public
     */
    isEdit;

    /**
     * @description Right to delete?
     * @type {boolean}
     * @public
     */
    isDelete;

    /**
     * @description Right to view all records?
     * @type {boolean}
     * @public
     */
    isViewAll;

    /**
     * @description Right to update all records?
     * @type {boolean}
     * @public
     */
    isModifyAll;
}

class SFDC_Organization extends DataWithoutScoring {
    
    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Organization' };

    /**
     * @description Salesforce Id
     * @type {string}
     * @public
     */
    id;
    
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name;
    
    /**
     * @description Type of this item
     * @type {string}
     * @public
     */
    type;

    /**
     * @description Is this organization a Developer Edition enviroment?
     * @type {boolean}
     * @public
     */
    isDeveloperEdition;

    /**
     * @description Is this organization a Sandbox environment?
     * @type {boolean}
     * @public
     */
    isSandbox;

    /**
     * @description Is this organization a Trial environment?
     * @type {boolean}
     * @public
     */
    isTrial;

    /**
     * @description Is this organization a Production environment?
     * @type {boolean}
     * @public
     */
    isProduction;

    /**
     * @description Local namespace of this organization
     * @type {string}
     * @public
     */
    localNamespace;
}

class SFDC_Package extends Data {
    
    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Package' };

    /**
     * @description Salesforce Id
     * @type {string}
     * @public
     */
    id;
    
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name;
    
    /**
     * @description Namespace
     * @type {string}
     * @public
     */
    namespace;
    
    /**
     * @description Type of this item
     * @type {string}
     * @public
     */
    type;
}

/** 
 * @description Cache Manager class implementation
 */
class DataCacheManager extends DataCacheManagerIntf {

    /**
     * @description Function to compress binary data
     * @type {function}
     * @private
     */
    _compress;
    
    /**
     * @description Function to decompress binary data
     * @type {function}
     * @private
     */
    _decompress;

    /**
     * @description Function to encore string to binary data
     * @type {function}
     * @private
     */
    _encode;
    
    /**
     * @description Function to decode binary data to string
     * @type {function}
     * @private
     */
    _decode;

    /**
     * @description Function to store an "item" in the storage with a given "key"
     * @type {function}
     * @private
     */
    _storageSetItem;

    /**
     * @description Function to retrieve an "item" in the storage from a given "key"
     * @type {function}
     * @private
     */
    _storageGetItem;

    /**
     * @description Function to remove an "item" in the storage from a given "key"
     * @type {function}
     * @private
     */
    _storageRemoveItem;

    /**
     * @description Function to retrieve the nth key in the storage based on its index
     * @type {function}
     * @private
     */
    _storageKey;

    /**
     * @description Function to retrieve all the keys in the storage
     * @type {function}
     * @private
     */
    _storageKeys;

    /**
     * @description Function to retrieve the number of keys/items stored in the storage
     * @type {function}
     * @private
     */
    _storageLength;

    /**
     * @description Cache Manager constructor
     * @param {any} configuration
     * @public
     */
    constructor(configuration) {
        super();
        this._compress = configuration.compress;
        this._decompress = configuration.decompress;
        this._encode = configuration.encode;
        this._decode = configuration.decode;
        this._storageSetItem = configuration.storage.setItem;
        this._storageGetItem = configuration.storage.getItem;
        this._storageRemoveItem = configuration.storage.removeItem;
        this._storageKey = configuration.storage.key;
        this._storageLength = configuration.storage.length;
        this._storageKeys = configuration.storage.keys;
    }

    /**
     * @description Is the cache has a specific key? (based on the metadata entry to make it faster!)
     * @param {string} key 
     * @returns {boolean} true if the cache has the key, false if not
     * @public
     */
    has(key) {
        const metadataPhysicalKey = GENERATE_PHYSICAL_KEY_METADATA(key);
        const dataPhysicalKey = GENERATE_PHYSICAL_KEY_DATA(key);
        // Get information about this key in the metadata first (it will be faster to deserialize!)
        /** @type {MetadataItemInCache} */
        const metadataEntry = this._getEntryFromCache(metadataPhysicalKey);
        // if we get null it means the data is not in the cache or it is too old
        if (metadataEntry === null) {
            // making sure the metadata and related data are removed from local storage if necessary
            this._storageRemoveItem(metadataPhysicalKey);
            this._storageRemoveItem(dataPhysicalKey);
        } else {
            // making sure the data exists in the localstorage (just the key -- do not spend time deserializing!)
            let dataKeyExists = false;
            for (let i = 0; i < this._storageLength() && dataKeyExists === false; i++) {
                if (this._storageKey(i) === dataPhysicalKey) {
                    dataKeyExists = true;
                }
            }
            if (dataKeyExists === false) {
                // the related data does not exist in the local storage
                // even though the metadata says the contrary...
                // so we are going to align the metadata with the data, by removing the metadata entry and return false
                this._storageRemoveItem(metadataPhysicalKey);
                return false;
            }
        }
        // in this case, the metadata and the data are aligned we can return this statement
        return (metadataEntry !== null);
    }

    /**
     * @description Get the entry form the cache (based on the data entry this time!)
     * @param {string} key 
     * @returns {Map | any}
     * @public
     */
    get(key) {
        const metadataPhysicalKey = GENERATE_PHYSICAL_KEY_METADATA(key);
        const dataPhysicalKey = GENERATE_PHYSICAL_KEY_DATA(key);
        // Get information about this key in the metadata first
        /** @type {MetadataItemInCache} */
        const metadataEntry = this._getEntryFromCache(metadataPhysicalKey);
        if (metadataEntry === null) {
            // making sure the metadata and related data are removed from local storage if necessary
            this._storageRemoveItem(metadataPhysicalKey);
            this._storageRemoveItem(dataPhysicalKey);  
            // return null as the metadata is not in the cache
            return null;          
        }
        // now get the data from the local storage
        /** @type {DataItemInCache} */
        const dataEntry = this._getEntryFromCache(dataPhysicalKey);
        if (dataEntry === null) {
            // here the metadata is in the cache but the data is not -- strange!
            // let's correct this by removing the metadata and return null
            this._storageRemoveItem(metadataPhysicalKey);
            return null;
        }
        // Make sure the metadata is up to date with the data
        metadataEntry.length = dataEntry.content.length;
        // ... and is saved!
        this._setItemToCache(metadataPhysicalKey, JSON.stringify(metadataEntry));
        // if the data is a map
        if (metadataEntry.type === 'map') {
            try {
                // create the map from the data (double array structure)
                return new Map(dataEntry.content);
            } catch (error) {
                // something went wrong when trying to create the map, so destroying everything!
                this._storageRemoveItem(metadataPhysicalKey);
                this._storageRemoveItem(dataPhysicalKey);  
                // return null as the metadata is not in the cache anymore
                return null;
            }
        } else { // if the data is something else
            return dataEntry.content;
        }
    }

    /**
     * @description Set an entry into the cache with a given key
     * @param {string} key 
     * @param {Map | any} value
     * @public
     */
    set(key, value) {
        const metadataPhysicalKey = GENERATE_PHYSICAL_KEY_METADATA(key);
        const dataPhysicalKey = GENERATE_PHYSICAL_KEY_DATA(key);
        if (value === null) {
            this._storageRemoveItem(metadataPhysicalKey);
            this._storageRemoveItem(dataPhysicalKey);
        } else {
            const now = Date.now();
            /** @type {MetadataItemInCache} */
            const metadataEntry = value instanceof Map ? {
                type: 'map', length: value.size, created: now
            } : {
                type: 'array', length: value.length, created: now
            };
            /** @type {DataItemInCache} */
            const dataEntry = value instanceof Map ? {
                content: Array.from(value.entries().filter(([k]) => k.endsWith('Ref') === false)), created: now
            } : {
                content: value, created: now
            };
            try {
                this._setItemToCache(dataPhysicalKey, JSON.stringify(dataEntry)); // this is more likely to throw an error if data exceeds the local storage limit, so do it first!
                this._setItemToCache(metadataPhysicalKey, JSON.stringify(metadataEntry));
            } catch(error) { 
                // Not able to store in local store that amount of data.
                // Making sure to clean both cache entries to be consistent
                this._storageRemoveItem(metadataPhysicalKey);
                this._storageRemoveItem(dataPhysicalKey);
            }
        }
    }

    /**
     * @description Get details of the cache.
     * @returns {Array<DataCacheItem>} an array of objects that contains the name, the type, the size and the creation date of each entry.
     */
    details() {
        return this._storageKeys()
            .filter((key) => key.startsWith(METADATA_CACHE_PREFIX))
            .map((key) => {
                /** @type {MetadataItemInCache} */
                const entry = this._getEntryFromCache(key);
                const name = GENERATE_LOGICAL_KEY(key);
                if (entry) {
                    return { name: name, isEmpty: entry.length === 0, isMap: entry.type === 'map', length: entry.length, created: entry.created };    
                }
                return { name: name, isEmpty: true, isMap: false, length: 0, created: 0 };
            }
        );
    }

    /**
     * @description Remove an entry of the cache.
     * @param {string} key 
     * @public
     */
    remove(key) {
        this._storageRemoveItem(GENERATE_PHYSICAL_KEY_DATA(key));
        this._storageRemoveItem(GENERATE_PHYSICAL_KEY_METADATA(key));
    }

    /**
     * @description Remove all Org-Check-related entries from the cache.
     * @public
     */
    clear() {
        return this._storageKeys()
            .filter((key) => key.startsWith(CACHE_PREFIX))
            .forEach((key) => this._storageRemoveItem(key));
    }

    /**
     * @description Set the item to the local storage with its key and string value. The string value is 
     *   encoded into a binary data. Then we compress this binary data into another binary data (hopefuly 
     *   shorter). Then that data is turned into a hexadecimal value. Finally we store the hexadecimal 
     *   data in the local storage with its key.
     * @param {string} key
     * @param {string} stringValue
     * @throws {Error} Most likely when trying to save the value in the local storage (_storageSetItem)
     * @private
     */
    _setItemToCache = (key, stringValue) => {
        let encodedValue, compressedValue, hexValue;
        try {
            encodedValue = this._encode(stringValue);
            compressedValue = this._compress(encodedValue);
            hexValue = FROM_BUFFER_TO_HEX(compressedValue);
            this._storageSetItem(key, hexValue);
        } catch (error) {
            throw new Error(
                `Error occured when trying to save the value for key ${key} with: `+
                    `hexValue.length=${hexValue?.length || 'N/A'}, `+
                    `compressedValue.length=${compressedValue?.length || 'N/A'}, `+
                    `encodedValue.length=${encodedValue?.length || 'N/A'}. `+
                    `Initiale error message was ${error.message}`
            );
        }
    }

    /**
     * @description Get the entry from the cache. If the entry is older than one day, it is removed from the cache.
     * @param {string} key
     * @returns {any} the entry from the cache
     * @private
     */
    _getEntryFromCache = (key) => {
        let entryFromStorage = null;
        try {
            const hexValue = this._storageGetItem(key);
            if (hexValue) {
                const bufferValue = FROM_HEX_TO_BUFFER(hexValue);
                const uncompressedValue = this._decompress(bufferValue);
                const decodedValue = this._decode(uncompressedValue);
                entryFromStorage = decodedValue;
            }
        } catch (error) {
            console.error(`Error occured when trying to get the value for key ${key}`, error);
        }
        if (!entryFromStorage) return null;
        try {
            const entry = JSON.parse(entryFromStorage);
            if (entry.created && Date.now() - entry.created > NB_MILLISEC_IN_ONE_DAY) return null;
            return entry;
        } catch (error) {
            console.error(`Error occured when trying to parse the string: ${entryFromStorage}`, error);
            return null;
        }
    }
}

/**
 * @description Cache prefix to use for any items stored in the local storage for Org Check
 * @type {string} 
 */
const CACHE_PREFIX = 'OrgCheck';

/**
 * @description Cache prefix to use for data stored in the local storage
 * @type {string} 
 */
const DATA_CACHE_PREFIX = `${CACHE_PREFIX}.`;

/**
 * @description Cache prefix to use for metadata stored in the local storage
 * @type {string} 
 */
const METADATA_CACHE_PREFIX = `${CACHE_PREFIX}_`;

/**
 * @description Generate the data physical key from either the logic key or the physical key. 
 *                  Data physical key starts with the DATA_CACHE_PREFIX and then the key itself.
 * @param {string} key
 * @returns {string} the data physical key
 * @private
 */
const GENERATE_PHYSICAL_KEY_DATA = (key) => {
    return key.startsWith(DATA_CACHE_PREFIX) ? key : DATA_CACHE_PREFIX + key;
};

/**
 * @description Generate the metadata physical key from either the logic key or the physical key. 
 *                  Metadata physical key starts with the METADATA_CACHE_PREFIX and then the key itself.
 * @param {string} key
 * @returns {string} the metadata physical key
 * @private
 */
const GENERATE_PHYSICAL_KEY_METADATA = (key) => {
    return key.startsWith(METADATA_CACHE_PREFIX) ? key : METADATA_CACHE_PREFIX + key;
};

/**
 * @description Generate the logical key from either the logic key or the physical key. 
 * @param {string} key
 * @returns {string} the logical key
 * @private
 */
const GENERATE_LOGICAL_KEY = (key) => {
    if (key.startsWith(METADATA_CACHE_PREFIX)) return key.substring(METADATA_CACHE_PREFIX.length);
    if (key.startsWith(DATA_CACHE_PREFIX)) return key.substring(DATA_CACHE_PREFIX.length);
    return key;
};

/**
 * @description Number of milliseconds in one day
 * @type {number} 
 */
const NB_MILLISEC_IN_ONE_DAY = 1000*60*60*24;

/**
 * @description Helper for conversion
 * @type {string[]}
 * @see https://www.xaymar.com/articles/2020/12/08/fastest-uint8array-to-hex-string-conversion-in-javascript/
 */
const LUT_HEX_4b = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];

/**
 * @description Helper for conversion
 * @type {string[]}  
 * @see https://www.xaymar.com/articles/2020/12/08/fastest-uint8array-to-hex-string-conversion-in-javascript/
 */
const LUT_HEX_8b = new Array(0x100);
for (let n = 0; n < 0x100; n++) {
  LUT_HEX_8b[n] = `${LUT_HEX_4b[(n >>> 4) & 0xF]}${LUT_HEX_4b[n & 0xF]}`;
}

/**
 * @description Binary array to Hexadecimal string
 * @type {function}
 * @param {Uint8Array} buffer 
 * @returns {string}
 * @see https://www.xaymar.com/articles/2020/12/08/fastest-uint8array-to-hex-string-conversion-in-javascript/
 */
const FROM_BUFFER_TO_HEX = (buffer) => {
  let out = '';
  for (let idx = 0, edx = buffer.length; idx < edx; idx++) {
    out += LUT_HEX_8b[buffer[idx]];
  }
  return out;
};

/**
 * @description Hexadecimal string to Binary array
 * @type {function}
 * @param {string} hex
 * @returns {Uint8Array}
 * @see https://www.xaymar.com/articles/2020/12/08/fastest-uint8array-to-hex-string-conversion-in-javascript/
 */
const FROM_HEX_TO_BUFFER = (hex) => {
    const arr = [];
    for (let i = 0; i < hex.length; i += 2) {
        arr.push(parseInt(hex.substring(i, i+2), 16));
    }
    return new Uint8Array(arr);
};

const EXCLUDED_OBJECT_PREFIXES = [ 
    '00a', // Comment for custom objects
    '017', // History for custom objects
    '02c', // Share for custom objects
    '0D5', // Feed for custom objects
    '1CE', // Event for custom objects
];

class DatasetCustomFields extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager
     * @param {DataFactoryIntf} dataFactory
     * @param {SimpleLoggerIntf} logger
     * @param {Map} parameters
     * @returns {Promise<Map<string, SFDC_Field>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger, parameters) {

        const fullObjectApiName = parameters?.get('object');

        // First SOQL query
        logger?.log(`Querying Tooling API about CustomField in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            tooling: true,
            string: 'SELECT Id, EntityDefinition.QualifiedApiName, EntityDefinition.IsCustomSetting, EntityDefinition.KeyPrefix ' +
                    'FROM CustomField ' +
                    `WHERE ManageableState IN ('installedEditable', 'unmanaged') ` +
                    (fullObjectApiName ? `AND EntityDefinition.QualifiedApiName = '${fullObjectApiName}'` : '')
        }], logger);

        // Init the factory and records
        const fieldDataFactory = dataFactory.getInstance(SFDC_Field);
        const customFieldRecords = results[0];

        logger?.log(`Parsing ${customFieldRecords.length} custom fields...`);        
        
        const entityInfoByCustomFieldId = new Map(await Processor.map(
            customFieldRecords, 
            (record) => [ 
                sfdcManager.caseSafeId(record.Id), 
                { 
                    qualifiedApiName: record.EntityDefinition.QualifiedApiName, 
                    isCustomSetting: record.EntityDefinition.IsCustomSetting 
                }
            ],
            (record) => {
                if (!record.EntityDefinition) return false; // ignore if no EntityDefinition linked
                if (EXCLUDED_OBJECT_PREFIXES.includes(record.EntityDefinition.KeyPrefix)) return false; // ignore these objects
                if (record.EntityDefinition.QualifiedApiName?.endsWith('_hd')) return false; // ignore the trending historical objects
                return true;
            }
        ));

        // Then retreive dependencies
        logger?.log(`Retrieving dependencies of ${customFieldRecords.length} custom fields...`);
        const customFieldsDependencies = await sfdcManager.dependenciesQuery(
            await Processor.map(customFieldRecords, (record) => sfdcManager.caseSafeId(record.Id)), 
            logger
        );

        // Get information about custom fields using metadata
        logger?.log(`Calling Tooling API Composite to get more information about these ${entityInfoByCustomFieldId.size} custom fields...`);
        const records = await sfdcManager.readMetadataAtScale('CustomField', Array.from(entityInfoByCustomFieldId.keys()), [], logger);

        // Create the map
        logger?.log(`Parsing ${records.length} custom fields...`);
        const customFields = new Map(await Processor.map(records, (record) => {

            // Get the ID15
            const id = sfdcManager.caseSafeId(record.Id);

            // Get Information about entity
            const entityInfo = entityInfoByCustomFieldId.get(id);

            // Create the instance (with score)
            const customField = fieldDataFactory.create({
                properties: {
                    id: id,
                    name: record.DeveloperName,
                    label: record.Metadata.label,
                    package: (record.NamespacePrefix || ''),
                    description: record.Description,
                    isCustom: true,
                    createdDate: record.CreatedDate,
                    lastModifiedDate: record.LastModifiedDate,
                    objectId: entityInfo.qualifiedApiName,
                    tooltip: record.InlineHelpText,
                    type: record.Metadata.type,
                    length: record.Metadata.length,
                    isUnique: record.Metadata.unique === true,
                    isEncrypted: record.Metadata.encryptionScheme !== null && record.Metadata.encryptionScheme !== 'None',
                    isExternalId: record.Metadata.externalId === true,
                    isIndexed: record.Metadata.unique === true || record.Metadata.externalId === true,
                    defaultValue: record.Metadata.defaultValue,
                    isRestrictedPicklist: record.Metadata.valueSet && record.Metadata.valueSet.restricted === true,
                    formula: record.Metadata.formula,
                    url: sfdcManager.setupUrl(id, SalesforceMetadataTypes.CUSTOM_FIELD, entityInfo.qualifiedApiName, sfdcManager.getObjectType( entityInfo.qualifiedApiName, entityInfo.isCustomSetting))
                }, 
                dependencies: {
                    data: customFieldsDependencies
                }
            });

            // Get information directly from the source code (if available)
            if (customField.formula) {
                const sourceCode = CodeScanner.RemoveComments(customField.formula);
                customField.hardCodedURLs = CodeScanner.FindHardCodedURLs(sourceCode);
                customField.hardCodedIDs = CodeScanner.FindHardCodedIDs(sourceCode);
            }
            
            // Compute the score of this item
            fieldDataFactory.computeScore(customField);

            // Add it to the map  
            return [ customField.id, customField ];
        }));

        // Return data as map
        logger?.log(`Done`);
        return customFields;
    } 
}

class DatasetCustomLabels extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager
     * @param {DataFactoryIntf} dataFactory
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<Map<string, SFDC_CustomLabel>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First SOQL query
        logger?.log(`Querying Tooling API about ExternalString in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            tooling: true,
            string: 'SELECT Id, Name, NamespacePrefix, Category, IsProtected, Language, '+
                        'MasterLabel, Value, CreatedDate, LastModifiedDate ' +
                    'FROM ExternalString ' +
                    `WHERE ManageableState IN ('installedEditable', 'unmanaged') `
        }], logger);

        // Init the factory and records
        const labelDataFactory = dataFactory.getInstance(SFDC_CustomLabel);
        const customLabelRecords = results[0];

        // Then retreive dependencies
        logger?.log(`Retrieving dependencies of ${customLabelRecords.length} custom labels...`);
        const customLabelsDependencies = await sfdcManager.dependenciesQuery(
            await Processor.map(customLabelRecords, (record) => sfdcManager.caseSafeId(record.Id)), 
            logger
        );
        
        // Create the map
        logger?.log(`Parsing ${customLabelRecords.length} custom labels...`);
        const customLabels = new Map(await Processor.map(customLabelRecords, (record) => {

            // Get the ID15 of this custom label
            const id = sfdcManager.caseSafeId(record.Id);

            // Create the instance
            const customLabel = labelDataFactory.createWithScore({
                properties: {
                    id: id,
                    name: record.Name,
                    package: (record.NamespacePrefix || ''),
                    category: record.Category,
                    isProtected: record.IsProtected === true,
                    language: record.Language,
                    label: record.MasterLabel,
                    value: record.Value,
                    createdDate: record.CreatedDate, 
                    lastModifiedDate: record.LastModifiedDate,
                    url: sfdcManager.setupUrl(id, SalesforceMetadataTypes.CUSTOM_LABEL)
                }, 
                dependencies: {
                    data: customLabelsDependencies
                }
            });

            // Add it to the map  
            return [ customLabel.id, customLabel ];
        }));

        // Return data as map
        logger?.log(`Done`);
        return customLabels;
    } 
}

class DatasetObject extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager
     * @param {DataFactoryIntf} dataFactory
     * @param {SimpleLoggerIntf} logger
     * @param {Map} parameters
     * @returns {Promise<SFDC_Object>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger, parameters) {

        // Init the factories
        const fieldDataFactory = dataFactory.getInstance(SFDC_Field);
        const fieldSetDataFactory = dataFactory.getInstance(SFDC_FieldSet);
        const layoutDataFactory = dataFactory.getInstance(SFDC_PageLayout);
        const limitDataFactory = dataFactory.getInstance(SFDC_Limit);
        const validationRuleDataFactory = dataFactory.getInstance(SFDC_ValidationRule);
        const webLinkDataFactory = dataFactory.getInstance(SFDC_WebLink);
        const recordTypeDataFactory = dataFactory.getInstance(SFDC_RecordType);
        const relationshipDataFactory = dataFactory.getInstance(SFDC_ObjectRelationShip);
        const objectDataFactory = dataFactory.getInstance(SFDC_Object);

        const fullObjectApiName = parameters?.get('object');
        const splittedApiName = fullObjectApiName.split('__');
        const packageName = splittedApiName.length === 3 ? splittedApiName[0] : '';
        
        const results = await Promise.all([
            sfdcManager.describe(fullObjectApiName, logger),
            sfdcManager.soqlQuery([{
                tooling: true, // We need the tooling to get the Description, ApexTriggers, FieldSets, ... which are not accessible from REST API)
                string: 'SELECT Id, DurableId, DeveloperName, Description, NamespacePrefix, ExternalSharingModel, InternalSharingModel, ' +
                            '(SELECT Id FROM ApexTriggers), ' +
                            '(SELECT Id, MasterLabel, Description FROM FieldSets), ' +
                            '(SELECT Id, Name, LayoutType FROM Layouts), ' +
                            '(SELECT DurableId, Label, Max, Remaining, Type FROM Limits), ' +
                            '(SELECT Id, Active, Description, ErrorDisplayField, ErrorMessage, ValidationName, NamespacePrefix, CreatedDate, LastModifiedDate FROM ValidationRules), ' +
                            '(SELECT Id, Name, Url, LinkType, OpenType, Description, CreatedDate, LastModifiedDate, NamespacePrefix FROM WebLinks) ' +
                        'FROM EntityDefinition ' +
                        `WHERE QualifiedApiName = '${fullObjectApiName}' ` +
                        (packageName ? `AND NamespacePrefix = '${packageName}' ` : '') +
                        'LIMIT 1' // We should get zero or one record, not more!
            }, {
                tooling: true,
                string: 'SELECT DurableId, QualifiedApiName, Description, IsIndexed ' +
                        'FROM FieldDefinition '+
                        `WHERE EntityDefinition.QualifiedApiName = '${fullObjectApiName}' ` +
                        (packageName ? `AND EntityDefinition.NamespacePrefix = '${packageName}' ` : ''),
                queryMoreField: 'DurableId' // FieldDefinition does not support calling QueryMore, use the custom instead
            }], logger),
            sfdcManager.recordCount(fullObjectApiName, logger)
        ]);

        // the first promise was describe
        // so we initialize the object with the first result
        const sobjectDescribed = results[0]; 
        const sobjectType = sfdcManager.getObjectType(sobjectDescribed.name, sobjectDescribed.customSetting);

        // the second promise was two soql queries on EntityDefinition and on FieldDefinition
        // so the first query response should be an EntityDefinition record corresponding to the object we want.
        const entity = results[1][0][0];
        if (!entity) { // If that entity was not found in the tooling API
            throw new TypeError(`No entity definition record found for: ${fullObjectApiName}`)
        }
        // and the second query response should be a list of FieldDefinition records corresponding to the fields of the object
        const fields = results[1][1]; 
                
        // the third promise is the number of records!!
        const recordCount = results[2]; 

        // fields (standard and custom)
        const customFieldIds = []; 
        const standardFieldsMapper = new Map();
        await Processor.forEach(fields, (f) => {
            if (f && f.DurableId && f.DurableId.split && f.DurableId.includes) {
                const id = sfdcManager.caseSafeId(f.DurableId.split('.')[1]);
                if (f.DurableId?.includes('.00N')) {
                    customFieldIds.push(id);
                } else {
                    standardFieldsMapper.set(f.QualifiedApiName, { 
                        id: id,
                        description: f.Description,
                        isIndexed: f.IsIndexed
                    });
                }
            }
        });
        const standardFields = await Processor.map(
            sobjectDescribed.fields,
            (field) => {
                const fieldMapper = standardFieldsMapper.get(field.name);
                return fieldDataFactory.createWithScore({
                    properties: {
                        id: fieldMapper.id,
                        name: field.label, 
                        label: field.label, 
                        description: fieldMapper.description,
                        tooltip: field.inlineHelpText,
                        type: field.type,
                        length: field.length,
                        isUnique: field.unique,
                        isEncrypted: field.encrypted,
                        isExternalId: field.externalId,
                        isIndexed: fieldMapper.isIndexed,
                        defaultValue: field.defaultValue,
                        formula: field.calculatedFormula,
                        url: sfdcManager.setupUrl(fieldMapper.id, SalesforceMetadataTypes.STANDARD_FIELD, entity.DurableId, sobjectType)
                    }
                });
            },
            (field) => standardFieldsMapper.has(field.name)
        );

        // apex triggers
        const apexTriggerIds = await Processor.map(
            entity.ApexTriggers?.records, 
            (t) => sfdcManager.caseSafeId(t.Id)
        );

        // field sets
        const fieldSets = await Processor.map(
            entity.FieldSets?.records,
            (t) => fieldSetDataFactory.createWithScore({ 
                properties: {
                    id: sfdcManager.caseSafeId(t.Id), 
                    label: t.MasterLabel, 
                    description: t.Description,
                    url: sfdcManager.setupUrl(t.Id, SalesforceMetadataTypes.FIELD_SET, entity.DurableId)
                }
            })
        );

        // page layouts
        const layouts = await Processor.map(
            entity.Layouts?.records,
            (t) => layoutDataFactory.createWithScore({ 
                properties: {
                    id: sfdcManager.caseSafeId(t.Id), 
                    name: t.Name, 
                    type: t.LayoutType,
                    url: sfdcManager.setupUrl(t.Id, SalesforceMetadataTypes.PAGE_LAYOUT, entity.DurableId)
                }
            })
        );
        
        // limits
        const limits = await Processor.map(
            entity.Limits?.records,
            (t) => limitDataFactory.createWithScore({ 
                properties: {
                    id: sfdcManager.caseSafeId(t.DurableId), 
                    label: t.Label, 
                    max: t.Max, 
                    remaining: t.Remaining, 
                    used: (t.Max-t.Remaining), 
                    usedPercentage: ((t.Max-t.Remaining)/t.Max),
                    type: t.Type 
                }
            })
        );
        
        // validation rules
        const validationRules = await Processor.map(
            entity.ValidationRules?.records,
            (t) => validationRuleDataFactory.createWithScore({ 
                properties: {
                    id: sfdcManager.caseSafeId(t.Id), 
                    name: t.ValidationName, 
                    isActive: t.Active,
                    description: t.Description,
                    errorDisplayField: t.ErrorDisplayField,
                    errorMessage: t.ErrorMessage,
                    package: (t.NamespacePrefix || ''),
                    createdDate: t.CreatedDate, 
                    lastModifiedDate: t.LastModifiedDate,
                    url: sfdcManager.setupUrl(t.Id, SalesforceMetadataTypes.VALIDATION_RULE)
                }
            })
        );
        
        // weblinks and actions
        const webLinks = await Processor.map(
            entity.WebLinks?.records,
            (t) => webLinkDataFactory.createWithScore({ 
                properties: {
                    id: sfdcManager.caseSafeId(t.Id), 
                    name: t.Name, 
                    hardCodedURLs: CodeScanner.FindHardCodedURLs(t.Url),
                    hardCodedIDs: CodeScanner.FindHardCodedIDs(t.Url),
                    type: t.LinkType,
                    behavior: t.OpenType,
                    package: (t.NamespacePrefix || ''),
                    createdDate: t.CreatedDate,
                    lastModifiedDate: t.LastModifiedDate,
                    description: t.Description,                
                    url: sfdcManager.setupUrl(t.Id, SalesforceMetadataTypes.WEB_LINK, entity.DurableId)
                }
            })
        );
        
        // record types
        const recordTypes = await Processor.map(
            sobjectDescribed.recordTypeInfos,
            (t) => recordTypeDataFactory.createWithScore({ 
                properties: {
                    id: sfdcManager.caseSafeId(t.recordTypeId), 
                    name: t.name, 
                    developerName: t.developerName, 
                    isActive: t.active,
                    isAvailable: t.available,
                    isDefaultRecordTypeMapping: t.defaultRecordTypeMapping,
                    isMaster: t.master,
                    url: sfdcManager.setupUrl(t.recordTypeId, SalesforceMetadataTypes.RECORD_TYPE, entity.DurableId)
                }
            })
        );
        
        // relationships
        const relationships = await Processor.map(
            sobjectDescribed.childRelationships,
            (relationship) => relationshipDataFactory.createWithScore({ 
                properties: {
                    name: relationship.relationshipName,
                    childObject: relationship.childSObject,
                    fieldName: relationship.field,
                    isCascadeDelete: relationship.cascadeDelete,
                    isRestrictedDelete: relationship.restrictedDelete
                }
            }),
            (relationship) => relationship.relationshipName !== null
        );

        const object = objectDataFactory.createWithScore({
            properties: {
                id: entity.DurableId,
                label: sobjectDescribed.label,
                labelPlural: sobjectDescribed.labelPlural,
                isCustom: sobjectDescribed.custom,
                isFeedEnabled: sobjectDescribed.feedEnabled,
                isMostRecentEnabled: sobjectDescribed.mruEnabled,
                isSearchable: sobjectDescribed.searchable,
                keyPrefix: sobjectDescribed.keyPrefix,
                name: entity.DeveloperName,
                apiname: sobjectDescribed.name,
                package: (entity.NamespacePrefix || ''),
                typeId: sobjectType,
                description: entity.Description,
                externalSharingModel: entity.ExternalSharingModel,
                internalSharingModel: entity.InternalSharingModel,
                apexTriggerIds: apexTriggerIds,
                fieldSets: fieldSets,
                limits: limits,
                layouts: layouts,
                validationRules: validationRules,
                webLinks: webLinks,
                standardFields: standardFields,
                customFieldIds: customFieldIds,
                recordTypes: recordTypes,
                relationships: relationships,
                recordCount: recordCount,
                url: sfdcManager.setupUrl(entity.Id, sobjectType)
            }
        });

        // Return data as object (and not as a map!!!)
        logger?.log(`Done`);
        return object;
    } 
}

class DatasetObjectPermissions extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager
     * @param {DataFactoryIntf} dataFactory
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<Map<string, SFDC_ObjectPermission>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First SOQL query
        logger?.log(`Querying REST API about ObjectPermissions in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            string: 'SELECT ParentId, Parent.IsOwnedByProfile, Parent.ProfileId, SobjectType, ' +
                        'CreatedDate, LastModifiedDate,PermissionsRead, PermissionsCreate, ' +
                        'PermissionsEdit, PermissionsDelete, PermissionsViewAllRecords, ' +
                        'PermissionsModifyAllRecords ' +
                    'FROM ObjectPermissions'
        }], logger);

        // Init the factory and records
        const permissionDataFactory = dataFactory.getInstance(SFDC_ObjectPermission);

        // Create the map
        const permissionRecords = results[0];
        logger?.log(`Parsing ${permissionRecords.length} object permissions...`);
        const permissions = new Map(await Processor.map(
            permissionRecords,
            (record) => {
                // Create the instance
                const permission = permissionDataFactory.create({
                    properties: {
                        parentId: sfdcManager.caseSafeId(record.Parent.IsOwnedByProfile === true ? record.Parent.ProfileId : record.ParentId),
                        objectType: record.SobjectType,
                        isRead: record.PermissionsRead,
                        isCreate: record.PermissionsCreate,
                        isEdit: record.PermissionsEdit,
                        isDelete: record.PermissionsDelete,
                        isViewAll: record.PermissionsViewAllRecords,
                        isModifyAll: record.PermissionsModifyAllRecords,
                        createdDate: record.CreatedDate, 
                        lastModifiedDate: record.LastModifiedDate,
                    }
                });

                // Add it to the map  
                return [ `${permission.parentId}_${permission.objectType}`, permission ];
            },
            (record) => record.Parent !== null // in some orgs, 'ParentId' is set to a value, BUT 'Parent' is null (because id can't be found!),
        ));

        // Return data as map
        logger?.log(`Done`);
        return permissions;
    } 
}

class DatasetAppPermissions extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager
     * @param {DataFactoryIntf} dataFactory
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<Map<string, SFDC_AppPermission>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First SOQL query
        logger?.log(`Querying REST API about SetupEntityAccess for TabSet in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            string: 'SELECT ApplicationId, IsAccessible, IsVisible '+
                    'FROM AppMenuItem ' +
                    'WHERE Type = \'TabSet\' '
        }, {
            string: 'SELECT SetupEntityId, ParentId, Parent.IsOwnedByProfile, Parent.ProfileId ' +
                    'FROM SetupEntityAccess ' +
                    'WHERE SetupEntityType = \'TabSet\' '
        }], logger);

        // Init the factory and records
        const appPermissionDataFactory = dataFactory.getInstance(SFDC_AppPermission);
        const appMenuItems = results[0];
        const setupEntityAccesses = results[1];

        // Create a map of the app menu items
        logger?.log(`Parsing ${appMenuItems.length} Application Menu Items...`);
        const appMenuItemAccesses = new Map(await Processor.map(appMenuItems, (record) => {
            return [ sfdcManager.caseSafeId(record.ApplicationId), { a: record.IsAccessible, v: record. IsVisible }] ;
        }));

        // Create the map
        logger?.log(`Parsing ${setupEntityAccesses.length} Application Menu Items...`);
        const appPermissions = new Map(await Processor.map(setupEntityAccesses, 
            (record) => {
                // Get the ID15 of this application
                const appId = sfdcManager.caseSafeId(record.SetupEntityId);
                const parentId = sfdcManager.caseSafeId(record.Parent.IsOwnedByProfile ? record.Parent.ProfileId : record.ParentId);

                // Get the appMenuItemAccesses
                const accesses = appMenuItemAccesses.get(appId);

                // Create the instance
                const appPermission = appPermissionDataFactory.create({
                    properties: {
                        appId: appId,
                        parentId: parentId,
                        isAccessible: accesses.a,
                        isVisible: accesses.v
                    }
                });

                // Add the app in map
                return [ `${appId}-${parentId}`, appPermission ];
            }, 
            (record) => { 
                // Make sure we only get the access for Application that have in AppMenuItem
                return appMenuItemAccesses.has(sfdcManager.caseSafeId(record.SetupEntityId));
            }
        ));

        // Return data as map
        logger?.log(`Done`);
        return appPermissions;
    }
}

class DatasetObjects extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager
     * @param {DataFactoryIntf} dataFactory
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<Map<string, SFDC_Object>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // Init the factory and records
        const objectDataFactory = dataFactory.getInstance(SFDC_Object);

        // Two actions to perform in parallel, global describe and an additional entity definition soql query
        logger?.log(`Performing a global describe and in parallel a SOQL query to EntityDefinition...`);            
        const results = await Promise.all([
            
            // Requesting information from the current salesforce org
            sfdcManager.describeGlobal(logger), // not using tooling api !!!

            // Some information are not in the global describe, we need to append them with EntityDefinition soql query
            sfdcManager.soqlQuery([{
                string: 'SELECT DurableId, NamespacePrefix, DeveloperName, QualifiedApiName, ' +
                            'ExternalSharingModel, InternalSharingModel ' +
                        'FROM EntityDefinition ' +
                        'WHERE keyPrefix <> null ' +
                        'AND DeveloperName <> null ' +
                        `AND (NOT(keyPrefix IN ('00a', '017', '02c', '0D5', '1CE'))) `+
                            // 00a	*Comment for custom objects
                            // 017	*History for custom objects
                            // 02c	*Share for custom objects
                            // 0D5	*Feed for custom objects
                            // 1CE	*Event for custom objects
                        `AND (NOT(QualifiedApiName like '%_hd')) `,
                            // We want to filter out trending historical objects
                tooling: true, // Using Tooling to get the Activity object
                queryMoreField: 'DurableId' // entityDef does not support calling QueryMore, use the custom instead
            }], logger)
        ]);

        const objectsDescription = results[0]; 
        const entities = results[1][0];
        const entitiesByName = {};
        const qualifiedApiNames = await Processor.map(
            entities, 
            (record) => { 
                entitiesByName[record.QualifiedApiName] = record; 
                return record.QualifiedApiName;
            }
        );

        // Create the map
        logger?.log(`Parsing ${objectsDescription.length} objects...`);
        const objects = new Map(await Processor.map(
            objectsDescription,
            (object) => {

                const type = sfdcManager.getObjectType(object.name, object.customSetting);
                const entity = entitiesByName[object.name];

                // Create the instance
                const obj = objectDataFactory.create({
                    properties: {
                        id: object.name,
                        label: object.label,
                        name: entity.DeveloperName,
                        apiname: object.name,
                        package: (entity.NamespacePrefix || ''),
                        typeId: type,
                        externalSharingModel: entity.ExternalSharingModel,
                        internalSharingModel: entity.InternalSharingModel,
                        url: sfdcManager.setupUrl(entity.DurableId, type)
                    }
                });

                // Add it to the map  
                return [ obj.id, obj ];
            },
            (object) => {
                return qualifiedApiNames?.includes(object.name) ? true : false;
            }
        ));

        // Return data as map
        logger?.log(`Done`);
        return objects;
    } 
}

/** @type {Array<{id: string, label: string}>} */ 
const OBJECTTYPES = [
    { id: OBJECTTYPE_ID_STANDARD_SOBJECT,        label: 'Standard Object' },
    { id: OBJECTTYPE_ID_CUSTOM_SOBJECT,          label: 'Custom Object' },
    { id: OBJECTTYPE_ID_CUSTOM_EXTERNAL_SOBJECT, label: 'External Object' },
    { id: OBJECTTYPE_ID_CUSTOM_SETTING,          label: 'Custom Setting' },
    { id: OBJECTTYPE_ID_CUSTOM_METADATA_TYPE,    label: 'Custom Metadata Type' },
    { id: OBJECTTYPE_ID_CUSTOM_EVENT,            label: 'Platform Event' },
    { id: OBJECTTYPE_ID_KNOWLEDGE_ARTICLE,       label: 'Knowledge Article' },
    { id: OBJECTTYPE_ID_CUSTOM_BIG_OBJECT,       label: 'Big Object' }
];

class DatasetObjectTypes extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager
     * @param {DataFactoryIntf} dataFactory
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<Map<string, SFDC_ObjectType>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {
    
        // Init the factory and records
        const objecTypeDataFactory = dataFactory.getInstance(SFDC_ObjectType);

        // Return data
        return new Map(OBJECTTYPES.map((type) => [ type.id, objecTypeDataFactory.create({ properties: { id: type.id, label: type.label }}) ]));
    } 
}

const ORGTYPE_PROD = 'Production';
const ORGTYPE_DE = 'Developer Edition';
const ORGTYPE_SANDBOX = 'Sandbox';
const ORGTYPE_TRIAL = 'Trial';

class DatasetOrganization extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager
     * @param {DataFactoryIntf} dataFactory
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<SFDC_Organization>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First SOQL query
        logger?.log(`Querying REST API about Organization in the org...`); 
        const results = await sfdcManager.soqlQuery([{
            string: 'SELECT Id, Name, IsSandbox, OrganizationType, TrialExpirationDate, ' +
                        'NamespacePrefix ' + 
                    'FROM Organization ' +
                    'LIMIT 1'
        }], logger);
        logger?.log(`Received result=${JSON.stringify(results)}`);
        logger?.log(`We need to get the first result and from there the first record...`);
        const record = results[0][0];
        logger?.log(`Parsing the result...`);

        // Init the factory and records
        const organizationDataFactory = dataFactory.getInstance(SFDC_Organization);

        // Set the type
        let type;
        if (record.OrganizationType === 'Developer Edition') type = ORGTYPE_DE;
        else if (record.IsSandbox === true) type = ORGTYPE_SANDBOX;
        else if (record.IsSandbox === false && record.TrialExpirationDate) type = ORGTYPE_TRIAL;
        else type = ORGTYPE_PROD;

        // Create the data
        const organization = organizationDataFactory.create({
            properties: {
                id: sfdcManager.caseSafeId(record.Id),
                name: record.Name,
                type: type,
                isDeveloperEdition: (type === ORGTYPE_DE),
                isSandbox: (type === ORGTYPE_SANDBOX),
                isTrial: (type === ORGTYPE_TRIAL),
                isProduction: (type === ORGTYPE_PROD),
                localNamespace: (record.NamespacePrefix || '')
            }
        });

        // Return data as map
        logger?.log(`Done`);
        return organization;
    } 
}

class DatasetCurrentUserPermissions extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager
     * @param {DataFactoryIntf} dataFactory
     * @param {SimpleLoggerIntf} logger
     * @param {Map} parameters
     * @returns {Promise<Map<string, boolean>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger, parameters) {

        const permissionFields = parameters?.get('permissions');

        // First SOQL query
        logger?.log(`Querying REST API about UserPermissionAccess in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            string: `SELECT ${permissionFields.map(p => `Permissions${p}`).join(`, `)} ` +
                    'FROM UserPermissionAccess '+
                    'LIMIT 1'
        }], logger);
        const permissions = results[0][0];
        logger?.log(`Parsing the results...`);            

        // Return data as map
        return new Map(await Processor.map(
            Object.keys(permissions),
            (field) => [ field, permissions[field] ],
            (field) => field.startsWith('Permissions')
        ));
    } 
}

class DatasetPackages extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager
     * @param {DataFactoryIntf} dataFactory
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<Map<string, SFDC_Package>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First SOQL queries
        logger?.log(`Querying Tooling API about InstalledSubscriberPackage and REST API about Organization in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            tooling: true,
            string: 'SELECT Id, SubscriberPackage.NamespacePrefix, SubscriberPackage.Name ' +
                    'FROM InstalledSubscriberPackage '
        }, {
            string: 'SELECT NamespacePrefix FROM Organization LIMIT 1 '
        }], logger);

        // Init the factory and records
        const packageDataFactory = dataFactory.getInstance(SFDC_Package);

        // Create the map
        const packageRecords = results[0];
        logger?.log(`Parsing ${packageRecords.length} installed packages...`);
        const packages = new Map(await Processor.map(packageRecords, (record) => {

            // Get the ID15 of this custom field
            const id = sfdcManager.caseSafeId(record.Id);

            // Create the instance
            const installedPackage = packageDataFactory.create({
                properties: {
                    id: id,
                    name: record.SubscriberPackage.Name,
                    namespace: record.SubscriberPackage.NamespacePrefix,
                    type: 'Installed'
                }
            });

            // Add it to the map  
            return [ installedPackage.id, installedPackage ];
        }));

        // Add potential package of the organization if it is set up
        const localPackage = results[1][0].NamespacePrefix;
        if (localPackage) {
            logger?.log(`Adding your local package ${localPackage}...`);
            packages.set(localPackage, packageDataFactory.create({
                properties: {
                    id: localPackage, 
                    name: localPackage, 
                    namespace: localPackage, 
                    type: 'Local'
                }
            }));
        }

        // Return data as map
        logger?.log(`Done`);
        return packages;
    } 
}

class DatasetPermissionSets extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager
     * @param {DataFactoryIntf} dataFactory
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<Map<string, SFDC_PermissionSet>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First SOQL queries
        logger?.log(`Querying REST API about PermissionSet, PermissionSetAssignment and PermissionSet (with a PermissionSetGroupId populated) in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            string: 'SELECT Id, Name, Description, IsCustom, License.Name, NamespacePrefix, Type, ' +
                        'PermissionsApiEnabled, PermissionsViewSetup, PermissionsModifyAllData, PermissionsViewAllData, ' +
                        'CreatedDate, LastModifiedDate ' +
                    'FROM PermissionSet ' +
                    'WHERE IsOwnedByProfile = FALSE '+
                    'ORDER BY Id '+
                    'LIMIT 2000'
        }, {
            byPasses: ['INVALID_TYPE'], // in some org PermissionSetGroup is not defined!
            string: 'SELECT Id, PermissionSetGroupId, PermissionSetGroup.Description ' +
                    'FROM PermissionSet ' +
                    'WHERE PermissionSetGroupId != null '+
                    'ORDER BY Id '+
                    'LIMIT 2000'
        }, {
            string: 'SELECT ParentId, COUNT(SobjectType) CountObject '+ 
                    'FROM ObjectPermissions '+
                    'WHERE Parent.IsOwnedByProfile = FALSE '+
                    'GROUP BY ParentId '+
                    'ORDER BY ParentId '+
                    'LIMIT 2000'
        },{
            string: 'SELECT ParentId, COUNT(Field) CountField '+ 
                    'FROM FieldPermissions '+
                    'WHERE Parent.IsOwnedByProfile = FALSE '+
                    'GROUP BY ParentId '+
                    'ORDER BY ParentId '+
                    'LIMIT 2000'
        },{
            string: 'SELECT PermissionSetId, COUNT(Id) CountAssignment '+ 
                    'FROM PermissionSetAssignment '+
                    'WHERE PermissionSet.IsOwnedByProfile = FALSE '+
                    'GROUP BY PermissionSetId '+
                    'ORDER BY PermissionSetId '+
                    'LIMIT 2000'
        }], logger);

        // All salesforce records
        const permissionSetRecords = results[0];
        const permissionSetGroupRecords = results[1];
        const objectPermissionRecords = results[2];
        const fieldPermissionRecords = results[3];
        const assignmentRecords = results[4];

        // Init the factory and records
        const permissionSetDataFactory = dataFactory.getInstance(SFDC_PermissionSet);

        // Create the map of permission sets
        logger?.log(`Parsing ${permissionSetRecords.length} permission sets...`);
        const permissionSets = new Map(await Processor.map(permissionSetRecords, (record) => {

            // Get the ID15
            const id = sfdcManager.caseSafeId(record.Id);
        
            // Is it a permission set or a permission set group?
            const isPermissionSetGroup = (record.Type === 'Group'); // other values can be 'Regular', 'Standard', 'Session'

            // Create the instance
            const permissionSet = permissionSetDataFactory.create({
                properties: {
                    id: id,
                    name: record.Name,
                    description: record.Description,
                    license: (record.License ? record.License.Name : ''),
                    isCustom: record.IsCustom,
                    package: (record.NamespacePrefix || ''),
                    memberCounts: 0, // default value, may be changed in second SOQL
                    isGroup: isPermissionSetGroup,  
                    type: (isPermissionSetGroup ? 'Permission Set Group' : 'Permission Set'),
                    createdDate: record.CreatedDate, 
                    lastModifiedDate: record.LastModifiedDate,
                    nbFieldPermissions: 0,
                    nbObjectPermissions: 0,
                    importantPermissions: {
                        apiEnabled: record.PermissionsApiEnabled === true,
                        viewSetup: record.PermissionsViewSetup === true, 
                        modifyAllData: record.PermissionsModifyAllData === true, 
                        viewAllData: record.PermissionsViewAllData === true
                    },
                    url: (isPermissionSetGroup === false ? sfdcManager.setupUrl(id, SalesforceMetadataTypes.PERMISSION_SET) : '')
                }
            });

            // Add it to the map  
            return [ permissionSet.id, permissionSet ];
        }));

        logger?.log(`Parsing ${permissionSetGroupRecords.length} permission set groups, ${objectPermissionRecords.length} object permissions and ${fieldPermissionRecords.length} field permissions...`);
        await Promise.all([
            Processor.forEach(permissionSetGroupRecords, (record) => {
                const permissionSetId = sfdcManager.caseSafeId(record.Id);
                const permissionSetGroupId = sfdcManager.caseSafeId(record.PermissionSetGroupId);
                if (permissionSets.has(permissionSetId)) {
                    const permissionSet = permissionSets.get(permissionSetId);
                    permissionSet.isGroup = true;
                    permissionSet.groupId = permissionSetGroupId;
                    permissionSet.url = sfdcManager.setupUrl(permissionSetGroupId, SalesforceMetadataTypes.PERMISSION_SET_GROUP);
                }
            }),
            Processor.forEach(objectPermissionRecords, (record) => {
                const permissionSetId = sfdcManager.caseSafeId(record.ParentId);
                if (permissionSets.has(permissionSetId)) {
                    const permissionSet = permissionSets.get(permissionSetId);
                    permissionSet.nbObjectPermissions = record.CountObject;
                }
            }),
            Processor.forEach(fieldPermissionRecords, (record) => {
                const permissionSetId = sfdcManager.caseSafeId(record.ParentId);
                if (permissionSets.has(permissionSetId)) {
                    const permissionSet = permissionSets.get(permissionSetId);
                    permissionSet.nbFieldPermissions = record.CountField;    
                }
            }),
            Processor.forEach(assignmentRecords, (record) => {
                const permissionSetId = sfdcManager.caseSafeId(record.PermissionSetId);
                if (permissionSets.has(permissionSetId)) {
                    const permissionSet = permissionSets.get(permissionSetId);
                    permissionSet.memberCounts = record.CountAssignment;    
                }
            })
        ]);

        // Compute scores for all permission sets
        logger?.log(`Computing the score for ${permissionSets.size} permission sets...`);
        await Processor.forEach(permissionSets, (permissionSet) => {
            permissionSetDataFactory.computeScore(permissionSet);
        });
        
        // Return data as map
        logger?.log(`Done`);
        return permissionSets;
    } 
}

class DatasetProfiles extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager
     * @param {DataFactoryIntf} dataFactory
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<Map<string, SFDC_Profile>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First SOQL query
        logger?.log(`Querying REST API about PermissionSet with IsOwnedByProfile=true in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            string: 'SELECT ProfileId, Profile.Name, Profile.Description, IsCustom, License.Name, NamespacePrefix, ' +
                        'PermissionsApiEnabled, PermissionsViewSetup, PermissionsModifyAllData, PermissionsViewAllData, ' +
                        'CreatedDate, LastModifiedDate ' +
                    'FROM PermissionSet ' + // oh yes we are not mistaken!
                    'WHERE isOwnedByProfile = TRUE '+
                    'ORDER BY ProfileId '+
                    'LIMIT 2000'
        }, {
            string: 'SELECT Parent.ProfileId, COUNT(SobjectType) CountObject '+ // warning: 'ProfileId' will be used as 'Parent.ProfileId' (bc aggregate query)
                    'FROM ObjectPermissions '+
                    'WHERE Parent.IsOwnedByProfile = TRUE '+
                    'GROUP BY Parent.ProfileId '+
                    'ORDER BY Parent.ProfileId '+
                    'LIMIT 2000'
        },{
            string: 'SELECT Parent.ProfileId, COUNT(Field) CountField '+ // warning: 'ProfileId' will be used as 'Parent.ProfileId' (bc aggregate query)
                    'FROM FieldPermissions '+
                    'WHERE Parent.IsOwnedByProfile = TRUE '+
                    'GROUP BY Parent.ProfileId '+
                    'ORDER BY Parent.ProfileId '+
                    'LIMIT 2000'
        },{
            string: 'SELECT PermissionSet.ProfileId, COUNT(Id) CountAssignment '+ // warning: 'ProfileId' will be used as 'PermissionSet.ProfileId' (bc aggregate query)
                    'FROM PermissionSetAssignment '+
                    'WHERE PermissionSet.IsOwnedByProfile = TRUE '+
                    'GROUP BY PermissionSet.ProfileId '+
                    'ORDER BY PermissionSet.ProfileId '+
                    'LIMIT 2000'
        }], logger);

        // All salesforce records
        const profileRecords = results[0];
        const objectPermissionRecords = results[1];
        const fieldPermissionRecords = results[2];
        const assignmentRecords = results[3];

        // Init the factory and records
        const profileDataFactory = dataFactory.getInstance(SFDC_Profile);

        // Create the map of profiles
        logger?.log(`Parsing ${profileRecords.length} profiles...`);
        const profiles = new Map(await Processor.map(profileRecords, (record) => {

            // Get the ID15
            const id = sfdcManager.caseSafeId(record.ProfileId);

            // Create the instance
            const profile = profileDataFactory.create({
                properties: {
                    id: id,
                    name: record.Profile.Name,
                    description: record.Profile.Description,
                    license: (record.License ? record.License.Name : ''),
                    isCustom: record.IsCustom,
                    package: (record.NamespacePrefix || ''),
                    memberCounts: 0,
                    createdDate: record.CreatedDate, 
                    lastModifiedDate: record.LastModifiedDate,
                    nbFieldPermissions: 0,
                    nbObjectPermissions: 0,
                    type: 'Profile',
                    importantPermissions: {
                        apiEnabled: record.PermissionsApiEnabled === true,
                        viewSetup: record.PermissionsViewSetup === true, 
                        modifyAllData: record.PermissionsModifyAllData === true, 
                        viewAllData: record.PermissionsViewAllData === true
                    },
                    url: sfdcManager.setupUrl(id, SalesforceMetadataTypes.PROFILE)
                }
            });

            // Add it to the map  
            return [ profile.id, profile ];
        }));

        logger?.log(`Parsing ${objectPermissionRecords.length} object permissions, ${fieldPermissionRecords.length} field permissions and ${assignmentRecords.length} assignments...`);
        await Promise.all([
            Processor.forEach(objectPermissionRecords, (record) => {
                const profileId = sfdcManager.caseSafeId(record.ProfileId); // see warning in the SOQL query (this is not a bug we use ProfileId instead of Parent.ProfileId)
                if (profiles.has(profileId)) {
                    const profile = profiles.get(profileId);
                    profile.nbObjectPermissions = record.CountObject;
                } else {
                    logger.log(`[objectPermissionRecords] Not Profile found with ID: ${profileId}, and we had Record=${JSON.stringify(record)}`);
                }
            }),
            Processor.forEach(fieldPermissionRecords, (record) => {
                const profileId = sfdcManager.caseSafeId(record.ProfileId); // see warning in the SOQL query (this is not a bug we use ProfileId instead of Parent.ProfileId)
                if (profiles.has(profileId)) {
                    const profile = profiles.get(profileId);
                    profile.nbFieldPermissions = record.CountField;    
                } else {
                    logger.log(`[fieldPermissionRecords] Not Profile found with ID: ${profileId}, and we had Record=${JSON.stringify(record)}`);
                }
            }),
            Processor.forEach(assignmentRecords, (record) => {
                const profileId = sfdcManager.caseSafeId(record.ProfileId); // see warning in the SOQL query (this is not a bug we use ProfileId instead of PermissionSet.ProfileId)
                if (profiles.has(profileId)) {
                    const profile = profiles.get(profileId);
                    profile.memberCounts = record.CountAssignment;    
                } else {
                    logger.log(`[assignmentRecords] Not Profile found with ID: ${profileId}, and we had Record=${JSON.stringify(record)}`);
                }
            })
        ]);

        // Compute scores for all permission sets
        logger?.log(`Computing the score for ${profiles.size} profiles...`);
        await Processor.forEach(profiles, (profile) => {
            profileDataFactory.computeScore(profile);
        });

        // Return data as map
        logger?.log(`Done`);
        return profiles;
    } 
}

const COMPUTE_NUMBER_FROM_IP = (ip) => {
    return ip?.split('.').reduce((prev, currentItem, currentIndex, array) => { 
        return prev + Number(currentItem) * Math.pow(255, array.length-1-currentIndex); 
    }, 0);
};

const WEEKDAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

class DatasetProfileRestrictions extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager
     * @param {DataFactoryIntf} dataFactory
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<Map<string, SFDC_ProfileRestrictions>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First SOQL query
        // (only ids because metadata can't be read via SOQL in bulk!
        logger?.log(`Querying REST API about Profile in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            string: 'SELECT Id FROM Profile'
        }], logger);
            
        // List of profile ids
        const profileIdRecords = results[0];
        logger?.log(`Parsing ${profileIdRecords.length} Profiles...`);
        const profileIds = await Processor.map(profileIdRecords, (record) => record.Id);

        // Init the factories
        const restrictionsFactory = dataFactory.getInstance(SFDC_ProfileRestrictions);
        const ipRangeDataFactory = dataFactory.getInstance(SFDC_ProfileIpRangeRestriction);
        const loginHourDataFactory = dataFactory.getInstance(SFDC_ProfileLoginHourRestriction);

        // Get information about profiles using metadata
        logger?.log(`Calling Tooling API Composite to get more information about these ${profileIds.length} profiles...`);
        const records = await sfdcManager.readMetadataAtScale('Profile', profileIds, [ 'UNKNOWN_EXCEPTION' ], logger);

        // Create the map
        logger?.log(`Parsing ${records.length} profile restrictions...`);
        const profileRestrictions = new Map(await Processor.map(records, async (record) => {

            // Get the ID15 of this profile
            const profileId = sfdcManager.caseSafeId(record.Id);

            // Login Hours
            let loginHours;
            if (record.Metadata.loginHours) {
                loginHours = await Processor.map(
                    WEEKDAYS,
                    (day) => {
                        const hourStart = record.Metadata.loginHours[day + 'Start'];
                        const hourEnd = record.Metadata.loginHours[day + 'End'];
                        return loginHourDataFactory.create({
                            properties: {
                                day: day,
                                fromTime: (('0' + Math.floor(hourStart / 60)).slice(-2) + ':' + ('0' + (hourStart % 60)).slice(-2)),
                                toTime:   (('0' + Math.floor(hourEnd   / 60)).slice(-2) + ':' + ('0' + (hourEnd   % 60)).slice(-2)),
                                difference: hourEnd - hourStart
                        }});
                });
            } else {
                loginHours = [];
            }

            // Ip Ranges
            let ipRanges;
            if (record.Metadata.loginIpRanges && record.Metadata.loginIpRanges.length > 0) {
                ipRanges = await Processor.map(
                    record.Metadata.loginIpRanges,
                    range => {
                        const startNumber = COMPUTE_NUMBER_FROM_IP(range.startAddress);
                        const endNumber = COMPUTE_NUMBER_FROM_IP(range.endAddress);
                        return ipRangeDataFactory.create({
                            properties: {
                                startAddress: range.startAddress,
                                endAddress: range.endAddress,
                                description: range.description || '(empty)',
                                difference: endNumber - startNumber + 1
                        }});
                });
            } else {
                ipRanges = [];
            }

            // Create the instance
            const profileRestriction = restrictionsFactory.createWithScore({
                properties: {
                    profileId: profileId,
                    ipRanges: ipRanges,
                    loginHours: loginHours
                }
            });

            // Add it to the map  
            return [ profileRestriction.profileId, profileRestriction ];
        }));

        // Return data as map
        logger?.log(`Done`);
        return profileRestrictions;
    } 
}

class DatasetProfilePasswordPolicies extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager
     * @param {DataFactoryIntf} dataFactory
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<Map<string, SFDC_ProfilePasswordPolicy>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First Metadata API query
        logger?.log(`Querying Metadata API about ProfilePasswordPolicy...`);
        const results = await sfdcManager.readMetadata([{ 
            type: 'ProfilePasswordPolicy',
            members: [ '*' ]
        }], logger);
            
        // List of policies
        const profilePasswordPolicies = results?.get('ProfilePasswordPolicy') || [];
        if (!profilePasswordPolicies) return new Map();

        // Init the factory and records
        const policyDataFactory = dataFactory.getInstance(SFDC_ProfilePasswordPolicy);

        // Create the map
        logger?.log(`Parsing ${profilePasswordPolicies.length} profile password policies...`);        
        const policies = new Map(
            await Processor.map(
                profilePasswordPolicies,
                (ppp) => {
                    // Create the instance
                    const policy = policyDataFactory.createWithScore({
                        properties: {
                            lockoutInterval: parseInt(ppp.lockoutInterval, 10),
                            maxLoginAttempts: parseInt(ppp.maxLoginAttempts, 10),
                            minimumPasswordLength: parseInt(ppp.minimumPasswordLength, 10),
                            minimumPasswordLifetime: (ppp.minimumPasswordLifetime === 'true'),
                            obscure: (ppp.obscure === 'true'),
                            passwordComplexity: parseInt(ppp.passwordComplexity, 10),
                            passwordExpiration: parseInt(ppp.passwordExpiration, 10),
                            passwordHistory: parseInt(ppp.passwordHistory, 10),
                            passwordQuestion: (ppp.passwordQuestion === '1'),
                            profileName: ppp.profile
                        }
                    });
                    // Add it to the map  
                    return [ policy.profileName, policy ];
                },
                // Metadata could return profile pwd policy for deleted profile
                // In this case, profile will be equal to { $: {xsi:nil: 'true'} } or an empty string
                // And we expect profile to be the name of the profile so....
                (ppp) => (typeof ppp.profile === 'string') && (ppp.profile !== '') // if "profile" is a string and is not empty, then the profile exists.
            )
        );

        // Return data as map
        logger?.log(`Done`);
        return policies;
    } 
}

class DatasetUsers extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager
     * @param {DataFactoryIntf} dataFactory
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<Map<string, SFDC_User>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First SOQL query
        logger?.log(`Querying REST API about internal active User in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            string: 'SELECT Id, Name, ProfileId, ' +
                        'LastLoginDate, LastPasswordChangeDate, NumberOfFailedLogins, ' +
                        'UserPreferencesLightningExperiencePreferred, ' +
                        '(SELECT PermissionSetId FROM PermissionSetAssignments WHERE PermissionSet.IsOwnedByProfile = false) ' + // optimisation?
                    'FROM User ' +
                    'WHERE IsActive = true ' + // we only want active users
                    'AND ContactId = NULL ' + // only internal users
                    'AND Profile.Id != NULL ' // we do not want the Automated Process users!
        }], logger);

        // Init the factory and records
        const userDataFactory = dataFactory.getInstance(SFDC_User);

        // Create the map
        const userRecords = results[0];
        logger?.log(`Parsing ${userRecords.length} users...`);
        const users = new Map(await Processor.map(userRecords, async (record) => {
        
            // Get the ID15 of this user
            const id = sfdcManager.caseSafeId(record.Id);

            // Get the ID15 of Permission Sets assigned to this user
            const permissionSetIdsAssigned = await Processor.map(
                record?.PermissionSetAssignments?.records, 
                (assignment) => sfdcManager.caseSafeId(assignment.PermissionSetId)
            );

            // Create the instance
            const user = userDataFactory.createWithScore({
                properties: {
                    id: id,
                    name: record.Name,
                    lastLogin: record.LastLoginDate,
                    numberFailedLogins: record.NumberOfFailedLogins,
                    onLightningExperience: record.UserPreferencesLightningExperiencePreferred,
                    lastPasswordChange: record.LastPasswordChangeDate,
                    profileId: sfdcManager.caseSafeId(record.ProfileId),
                    permissionSetIds: permissionSetIdsAssigned,
                    url: sfdcManager.setupUrl(id, SalesforceMetadataTypes.USER)
                }
            });

            // Add it to the map  
            return [ user.id, user ];
        }));

        // Return data as map
        logger?.log(`Done`);
        return users;
    } 
}

class DatasetVisualForcePages extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager
     * @param {DataFactoryIntf} dataFactory
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<Map<string, SFDC_VisualForcePage>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First SOQL query
        logger?.log(`Querying Tooling API about ApexPage in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            tooling: true,
            string: 'SELECT Id, Name, ApiVersion, NamespacePrefix, Description, IsAvailableInTouch, ' +
                        'Markup, CreatedDate, LastModifiedDate ' +
                    'FROM ApexPage ' +
                    `WHERE ManageableState IN ('installedEditable', 'unmanaged')`
        }], logger);

        // Init the factory and records
        const pageDataFactory = dataFactory.getInstance(SFDC_VisualForcePage);
        const pageRecords = results[0];

        // Then retreive dependencies
        logger?.log(`Retrieving dependencies of ${pageRecords.length} visualforce pages...`);
        const pagesDependencies = await sfdcManager.dependenciesQuery(
            await Processor.map(pageRecords, (record) => sfdcManager.caseSafeId(record.Id)), 
            logger
        );

        // Create the map
        logger?.log(`Parsing ${pageRecords.length} visualforce pages...`);
        const pages = new Map(await Processor.map(pageRecords, (record) => {

            // Get the ID15
            const id = sfdcManager.caseSafeId(record.Id);

            // Create the instance
            const page = pageDataFactory.create({
                properties: {
                    id: id,
                    name: record.Name,
                    apiVersion: record.ApiVersion,
                    isMobileReady: record.IsAvailableInTouch,
                    package: (record.NamespacePrefix || ''),
                    createdDate: record.CreatedDate,
                    lastModifiedDate: record.LastModifiedDate,
                    description: record.Description,
                    url: sfdcManager.setupUrl(id, SalesforceMetadataTypes.VISUAL_FORCE_PAGE)
                }, 
                dependencies: {
                    data: pagesDependencies
                }
            });

            // Get information directly from the source code (if available)
            if (record.Markup) {
                const sourceCode = CodeScanner.RemoveComments(record.Markup);
                page.hardCodedURLs = CodeScanner.FindHardCodedURLs(sourceCode);
                page.hardCodedIDs = CodeScanner.FindHardCodedIDs(sourceCode);
            }
            
            // Compute the score of this item
            pageDataFactory.computeScore(page);

            // Add it to the map  
            return [ page.id, page ];
        }));

        // Return data as map
        logger?.log(`Done`);
        return pages;
    } 
}

class DatasetVisualForceComponents extends Dataset {
    
    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager
     * @param {DataFactoryIntf} dataFactory
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<Map<string, SFDC_VisualForceComponent>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First SOQL query
        logger?.log(`Querying Tooling API about ApexComponent in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            tooling: true,
            string: 'SELECT Id, Name, ApiVersion, NamespacePrefix, Description, ' +
                        'Markup, CreatedDate, LastModifiedDate ' +
                    'FROM ApexComponent ' +
                    `WHERE ManageableState IN ('installedEditable', 'unmanaged') `
        }], logger);

        // Init the factory and records
        const componentDataFactory = dataFactory.getInstance(SFDC_VisualForceComponent);
        const componentRecords = results[0];

        // Then retreive dependencies
        logger?.log(`Retrieving dependencies of ${componentRecords.length} visualforce components...`);
        const componentsDependencies = await sfdcManager.dependenciesQuery(
            await Processor.map(componentRecords, (record) => sfdcManager.caseSafeId(record.Id)), 
            logger
        );

        // Create the map
        logger?.log(`Parsing ${componentRecords.length} visualforce components...`);
        const components = new Map(await Processor.map(componentRecords, (record) => {

            // Get the ID15 of this custom field
            const id = sfdcManager.caseSafeId(record.Id);

            // Create the instance
            const component = componentDataFactory.create({
                properties: {
                    id: id,
                    name: record.Name,
                    apiVersion: record.ApiVersion,
                    package: (record.NamespacePrefix || ''),
                    createdDate: record.CreatedDate,
                    lastModifiedDate: record.LastModifiedDate,
                    description: record.Description,
                    url: sfdcManager.setupUrl(id, SalesforceMetadataTypes.VISUAL_FORCE_COMPONENT)
                }, 
                dependencies: {
                    data: componentsDependencies
                }
            });

            // Get information directly from the source code (if available)
            if (record.Markup) {
                const sourceCode = CodeScanner.RemoveComments(record.Markup);
                component.hardCodedURLs = CodeScanner.FindHardCodedURLs(sourceCode);
                component.hardCodedIDs = CodeScanner.FindHardCodedIDs(sourceCode);
            }

            // Compute the score of this item
            componentDataFactory.computeScore(component);

            // Add it to the map  
            return [ component.id, component ];
        }));

        // Return data as map
        logger?.log(`Done`);
        return components;
    } 
}

class DatasetLightningAuraComponents extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager
     * @param {DataFactoryIntf} dataFactory
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<Map<string, SFDC_LightningAuraComponent>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First SOQL query
        logger?.log(`Querying Tooling API about AuraDefinitionBundle in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            tooling: true,
            string: 'SELECT Id, MasterLabel, ApiVersion, NamespacePrefix, Description, ' +
                        'CreatedDate, LastModifiedDate ' +
                    'FROM AuraDefinitionBundle ' +
                    `WHERE ManageableState IN ('installedEditable', 'unmanaged') `
        }], logger);

        // Init the factory and records
        const componentDataFactory = dataFactory.getInstance(SFDC_LightningAuraComponent);
        const componentRecords = results[0];

        // Then retreive dependencies
        logger?.log(`Retrieving dependencies of ${componentRecords.length} lightning aura components...`);
        const componentsDependencies = await sfdcManager.dependenciesQuery(
            await Processor.map(componentRecords, (record) => sfdcManager.caseSafeId(record.Id)), 
            logger
        );
        
        // Create the map
        logger?.log(`Parsing ${componentRecords.length} lightning aura components...`);
        const components = new Map(await Processor.map(componentRecords, (record) => {

            // Get the ID15 of this custom field
            const id = sfdcManager.caseSafeId(record.Id);

            // Create the instance
            const component = componentDataFactory.createWithScore({
                properties: {
                    id: id,
                    name: record.MasterLabel,
                    apiVersion: record.ApiVersion,
                    package: (record.NamespacePrefix || ''),
                    createdDate: record.CreatedDate,
                    lastModifiedDate: record.LastModifiedDate,
                    description: record.Description,
                    url: sfdcManager.setupUrl(id, SalesforceMetadataTypes.AURA_WEB_COMPONENT)
                }, 
                dependencies: {
                    data: componentsDependencies
                }
            });

            // Add it to the map  
            return [ component.id, component ];
        }));

        // Return data as map
        logger?.log(`Done`);
        return components;
    } 
}

class DatasetLightningWebComponents extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager
     * @param {DataFactoryIntf} dataFactory
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<Map<string, SFDC_LightningWebComponent>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First SOQL query
        logger?.log(`Querying Tooling API about LightningComponentBundle in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            tooling: true,
            string: 'SELECT Id, MasterLabel, ApiVersion, NamespacePrefix, Description, ' +
                        'CreatedDate, LastModifiedDate ' +
                    'FROM LightningComponentBundle ' +
                    `WHERE ManageableState IN ('installedEditable', 'unmanaged') `
        }], logger);

        // Init the factory and records
        const componentDataFactory = dataFactory.getInstance(SFDC_LightningWebComponent);
        const componentRecords = results[0];

        // Then retreive dependencies
        logger?.log(`Retrieving dependencies of ${componentRecords.length} lightning web components...`);
        const componentsDependencies = await sfdcManager.dependenciesQuery(
            await Processor.map(componentRecords, (record) => sfdcManager.caseSafeId(record.Id)), 
            logger
        );

        // Create the map
        logger?.log(`Parsing ${componentRecords.length} lightning web components...`);
        const components = new Map(await Processor.map(componentRecords, (record) => {

            // Get the ID15 of this custom field
            const id = sfdcManager.caseSafeId(record.Id);

            // Create the instance
            const component = componentDataFactory.createWithScore({
                properties: {
                    id: id,
                    name: record.MasterLabel,
                    apiVersion: record.ApiVersion,
                    package: (record.NamespacePrefix || ''),
                    createdDate: record.CreatedDate,
                    lastModifiedDate: record.LastModifiedDate,
                    description: record.Description,
                    url: sfdcManager.setupUrl(id, SalesforceMetadataTypes.LIGHTNING_WEB_COMPONENT)
                }, 
                dependencies: {
                    data: componentsDependencies
                }
            });

            // Add it to the map  
            return [ component.id, component ];
        }));

        // Return data as map
        logger?.log(`Done`);
        return components;
    } 
}

class DatasetLightningPages extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager
     * @param {DataFactoryIntf} dataFactory
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<Map<string, SFDC_LightningPage>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First SOQL query
        logger?.log(`Querying Tooling API about FlexiPage in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            tooling: true,
            string: 'SELECT Id, MasterLabel, EntityDefinition.QualifiedApiName, ' +
                        'Type, NamespacePrefix, Description, ' +
                        'CreatedDate, LastModifiedDate ' +
                    'FROM FlexiPage ' +
                    `WHERE ManageableState IN ('installedEditable', 'unmanaged') `
        }], logger);

        // Init the factory and records
        const pageDataFactory = dataFactory.getInstance(SFDC_LightningPage);
        const pageRecords = results[0];

        // Then retreive dependencies
        logger?.log(`Retrieving dependencies of ${pageRecords.length} lightning pages...`);
        const pagesDependencies = await sfdcManager.dependenciesQuery(
            await Processor.map(pageRecords, (record) => sfdcManager.caseSafeId(record.Id)), 
            logger
        );

        // Create the map
        logger?.log(`Parsing ${pageRecords.length} lightning pages...`);
        const pages = new Map(await Processor.map(pageRecords, (record) => {

            // Get the ID15
            const id = sfdcManager.caseSafeId(record.Id);

            // Create the instance
            const page = pageDataFactory.createWithScore({
                properties: {
                    id: id,
                    name: record.MasterLabel,
                    type: record.Type,
                    package: (record.NamespacePrefix || ''),
                    createdDate: record.CreatedDate,
                    lastModifiedDate: record.LastModifiedDate,
                    description: record.Description,
                    objectId: (record.EntityDefinition?.QualifiedApiName || ''),
                    url: sfdcManager.setupUrl(id, SalesforceMetadataTypes.LIGHTNING_PAGE)
                }, 
                dependencies: {
                    data: pagesDependencies
                }
            });

            // Add it to the map  
            return [ page.id, page ];
        }));

        // Return data as map
        logger?.log(`Done`);
        return pages;
    } 
}

class DatasetGroups extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager
     * @param {DataFactoryIntf} dataFactory
     * @param {SimpleLoggerIntf} logger List of optional argument to pass
     * @returns {Promise<Map<string, SFDC_Group>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First SOQL query
        logger?.log(`Querying REST API about Group in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            string: 'SELECT Id, Name, DeveloperName, DoesIncludeBosses, Type, RelatedId, Related.Name, ' +
                        '(SELECT UserOrGroupId From GroupMembers)' + // optimisation?
                    'FROM Group '
        }], logger);

        // Init the factory and records
        const groupDataFactory = dataFactory.getInstance(SFDC_Group);

        // Create the map
        const groupRecords = results[0];
        logger?.log(`Parsing ${groupRecords.length} groups...`);
        const groups = new Map(await Processor.map(groupRecords, async (record) => {
        
            // Get the ID15 of this custom field
            const groupId = sfdcManager.caseSafeId(record.Id);

            // Depending on the type we have some specific properties
            let groupType, groupName, groupDeveloperName, groupIncludesBosses, groupIncludesSubordinates, groupRelatedId;
            switch (record.Type) {
                case 'Regular': 
                case 'Queue': {
                    groupType = record.Type === 'Regular' ? SalesforceMetadataTypes.PUBLIC_GROUP : SalesforceMetadataTypes.QUEUE;
                    groupName = record.Name;
                    groupDeveloperName = record.DeveloperName;
                    groupIncludesBosses = record.DoesIncludeBosses;
                    break;
                }
                case 'Role':
                case 'RoleAndSubordinates':
                case 'RoleAndSubordinatesInternal': {
                    groupType = SalesforceMetadataTypes.ROLE;
                    groupName = record.Related.Name;
                    groupIncludesSubordinates = record.Type !== 'Role';
                    groupRelatedId = sfdcManager.caseSafeId(record.RelatedId);
                    break;
                }
                case 'AllCustomerPortal':
                case 'Organization':
                case 'PRMOrganization':
                case 'GuestUserGroup':
                default: {
                    groupName = record.Type;
                    groupType = SalesforceMetadataTypes.TECHNICAL_GROUP;
                    break;
                }
            }

            // Handle the direct group membership
            const groupDirectUserIds = [], groupDirectGroupIds = [];
            if (record.GroupMembers && record.GroupMembers.records && record.GroupMembers.records.length > 0) {
                await Processor.forEach(
                    record.GroupMembers.records, 
                    (m) => {
                        const groupMemberId = sfdcManager.caseSafeId(m.UserOrGroupId);
                        (groupMemberId.startsWith('005') ? groupDirectUserIds : groupDirectGroupIds).push(groupMemberId);
                    }
                );
            }

            // Create the instance (common one)
            const group = groupDataFactory.createWithScore({
                properties: {
                    id: groupId,
                    name: groupName, 
                    developerName: groupDeveloperName, 
                    type: groupType,
                    isPublicGroup: record.Type === 'Regular',
                    isQueue: record.Type === 'Queue',
                    nbDirectMembers: groupDirectUserIds.length + groupDirectGroupIds.length,
                    directUserIds: groupDirectUserIds,
                    directGroupIds: groupDirectGroupIds,
                    includeBosses: groupIncludesBosses === true, 
                    includeSubordinates: groupIncludesSubordinates === true,
                    relatedId: groupRelatedId,
                    url: sfdcManager.setupUrl(groupRelatedId ?? groupId, groupType)
                }
            });

            // Add it to the map  
            return [ group.id, group ];
        }));

        // Return data as map
        logger?.log(`Done`);
        return groups;
    } 
}

class DatasetApexClasses extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager
     * @param {DataFactoryIntf} dataFactory
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<Map<string, SFDC_ApexClass>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First SOQL queries
        logger?.log(`Querying Tooling API about ApexClass, ApexCodeCoverage, ApexCodeCoverageAggregate and AsyncApexJob in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            string: 'SELECT Id, Name, ApiVersion, NamespacePrefix, ' +
                        'Body, LengthWithoutComments, SymbolTable, ' +
                        'CreatedDate, LastModifiedDate ' +
                    'FROM ApexClass ' +
                    `WHERE ManageableState IN ('installedEditable', 'unmanaged') `,
            tooling: true
        }, {
            string: 'SELECT ApexClassOrTriggerId, ApexTestClassId ' +
                    'FROM ApexCodeCoverage ' +
                    'GROUP BY ApexClassOrTriggerId, ApexTestClassId ',
            queryMoreField: 'CreatedDate',
            tooling: true
        }, {
            string: 'SELECT ApexClassorTriggerId, NumLinesCovered, ' +
                        'NumLinesUncovered, Coverage ' +
                    'FROM ApexCodeCoverageAggregate ',
            tooling: true
        }, {
            string: 'SELECT ApexClassId ' +
                    'FROM AsyncApexJob ' +
                    `WHERE JobType = 'ScheduledApex' `
        }, {
            string: 'SELECT id, ApexClassId, MethodName, ApexTestRunResult.CreatedDate, '+
                        'RunTime, Outcome, StackTrace, (SELECT Cpu, AsyncCalls, Sosl, Soql, QueryRows, DmlRows, Dml FROM ApexTestResults LIMIT 1) '+
                    'FROM ApexTestResult '+
                    `WHERE (Outcome != 'Pass' OR RunTime > 20000) `+
                    `AND ApexTestRunResult.Status = 'Completed' `+
                    `AND ApexClass.ManageableState IN ('installedEditable', 'unmanaged') `+
                    'ORDER BY ApexClassId, ApexTestRunResult.CreatedDate desc, MethodName ',
            tooling: true
        }], logger);

        // Init the factory and records and records
        const apexClassDataFactory = dataFactory.getInstance(SFDC_ApexClass);
        const apexTestResultDataFactory = dataFactory.getInstance(SFDC_ApexTestMethodResult);
        const apexClassRecords = results[0];
        const apexCodeCoverageRecords = results[1];
        const apexCodeCoverageAggRecords = results[2];
        const asyncApexJobRecords = results[3];
        const apexTestResultRecords = results[4];

        // Then retreive dependencies
        logger?.log(`Retrieving dependencies of ${apexClassRecords.length} apex classes...`);
        const apexClassesDependencies = await sfdcManager.dependenciesQuery(
            await Processor.map(apexClassRecords, (record) => sfdcManager.caseSafeId(record.Id)), 
            logger
        );

        // Part 1b- apex classes
        logger?.log(`Parsing ${apexClassRecords.length} apex classes...`);
        const apexClasses = new Map(await Processor.map(apexClassRecords, async (record) => {

            // Get the ID15
            const id = sfdcManager.caseSafeId(record.Id);
            
            // Create the instance
            const apexClass = apexClassDataFactory.create({
                properties: {
                    id: id,
                    name: record.Name,
                    apiVersion: record.ApiVersion,
                    package: (record.NamespacePrefix || ''),
                    isTest: false,
                    isAbstract: false,
                    isClass: true,
                    isEnum: false,
                    isInterface: false,
                    isSchedulable: false,
                    isScheduled: false,
                    length: record.LengthWithoutComments,
                    needsRecompilation: (!record.SymbolTable ? true : false),
                    coverage: 0, // by default no coverage!
                    relatedTestClasses: [],
                    relatedClasses: [],
                    createdDate: record.CreatedDate,
                    lastModifiedDate: record.LastModifiedDate,
                    url: sfdcManager.setupUrl(id, SalesforceMetadataTypes.APEX_CLASS)
                }, 
                dependencies: {
                    data: apexClassesDependencies
                }
            });

            // Get information from the compilation output information by the Apex compiler on salesforce side (if available)
            if (record.SymbolTable) {
                apexClass.innerClassesCount = record.SymbolTable.innerClasses?.length || 0;
                apexClass.interfaces = record.SymbolTable.interfaces;
                apexClass.isSchedulable = record.SymbolTable.interfaces?.includes('System.Schedulable') ?? false;
                apexClass.methodsCount = record.SymbolTable.methods?.length || 0;
                apexClass.extends = record.SymbolTable.parentClass;
                if (record.SymbolTable.tableDeclaration) {
                    apexClass.annotations = record.SymbolTable.tableDeclaration.annotations?.map((a) => a?.name ?? a);
                    await Processor.forEach(record.SymbolTable.tableDeclaration.modifiers, m => {
                        switch (m) {
                            case 'with sharing':      apexClass.specifiedSharing = 'with';      break;
                            case 'without sharing':   apexClass.specifiedSharing = 'without';   break;
                            case 'inherited sharing': apexClass.specifiedSharing = 'inherited'; break;
                            case 'public':            apexClass.specifiedAccess  = 'public';    break;
                            case 'private':           apexClass.specifiedAccess  = 'private';   break;
                            case 'global':            apexClass.specifiedAccess  = 'global';    break;
                            case 'virtual':           apexClass.specifiedAccess  = 'virtual';   break;
                            case 'abstract':          apexClass.isAbstract       = true;        break;
                            case 'testMethod':        apexClass.isTest           = true;        break;
                            default:                  console.error(`Unsupported modifier in SymbolTable.tableDeclaration: ${m} (ApexClassId=${apexClass.id})`);
                        }
                    });
                }
            }
            
            // Get information directly from the source code (if available)
            if (record.Body) {
                const sourceCode = CodeScanner.RemoveComments(record.Body);
                apexClass.isInterface = CodeScanner.IsInterface(sourceCode);
                apexClass.isEnum = CodeScanner.IsEnum(sourceCode);
                apexClass.isClass = (apexClass.isInterface === false && apexClass.isEnum === false);
                apexClass.hardCodedURLs = CodeScanner.FindHardCodedURLs(sourceCode);
                apexClass.hardCodedIDs = CodeScanner.FindHardCodedIDs(sourceCode);
                
                // Specific scanning for Test Classes
                if (apexClass.isTest === true) { // this is defined only from the SymbolTable!
                    apexClass.isTestSeeAllData = CodeScanner.IsTestSeeAllData(sourceCode);
                    apexClass.nbSystemAsserts = CodeScanner.CountOfAsserts(sourceCode);
                }
            }

            // Refine sharing spec
            if (apexClass.isEnum === true || apexClass.isInterface === true) apexClass.specifiedSharing = 'Not applicable';

            // Add it to the map  
            return [ apexClass.id, apexClass ];
        }));

        // Part 2- add the related tests to apex classes
        logger?.log(`Parsing ${apexCodeCoverageRecords.length} apex code coverages...`);
        const relatedTestsByApexClass = new Map();
        const relatedClassesByApexTest = new Map();
        await Processor.forEach(
            apexCodeCoverageRecords,
            (record) => {
                // Get the ID15 of the class that is tested and the test class
                const id = sfdcManager.caseSafeId(record.ApexClassOrTriggerId);
                const testId = sfdcManager.caseSafeId(record.ApexTestClassId);
                if (apexClasses.has(id)) { // make sure the id is an existing class!
                    // Add the relationships between class and test class
                    if (relatedTestsByApexClass.has(id) === false) relatedTestsByApexClass.set(id, new Set());
                    if (relatedClassesByApexTest.has(testId) === false) relatedClassesByApexTest.set(testId, new Set());
                    relatedTestsByApexClass.get(id).add(testId);
                    relatedClassesByApexTest.get(testId).add(id);
                }
            }
        );
        await Processor.forEach(relatedTestsByApexClass, (relatedTestsIds, apexClassId) => {
            if (apexClasses.has(apexClassId)) { // Just to be safe!
                apexClasses.get(apexClassId).relatedTestClassIds = Array.from(relatedTestsIds);
            }
        });
        await Processor.forEach(relatedClassesByApexTest, (relatedClassesIds, apexTestId) => {
            if (apexClasses.has(apexTestId)) { // In case a test from a package is covering a classe the id will not be in the Class map!
                apexClasses.get(apexTestId).relatedClassIds = Array.from(relatedClassesIds);
            }
        });

        // Part 3- add the aggregate code coverage to apex classes
        logger?.log(`Parsing ${apexCodeCoverageAggRecords.length} apex code coverage aggregates...`);
        await Processor.forEach(
            apexCodeCoverageAggRecords,
            (record) => {
                // Get the ID15 of the class that is tested
                const id = sfdcManager.caseSafeId(record.ApexClassOrTriggerId);
                if (apexClasses.has(id)) { // make sure the id is an existing class!
                    // set the coverage of that class
                    apexClasses.get(id).coverage = (record.NumLinesCovered / (record.NumLinesCovered + record.NumLinesUncovered));
                }
            }
        );

        // Part 4- add if class is scheduled
        logger?.log(`Parsing ${asyncApexJobRecords.length} schedule apex classes...`);
        await Processor.forEach(
            asyncApexJobRecords,
            (record) => {
                // Get the ID15 of the class that is scheduled
                const id = sfdcManager.caseSafeId(record.ApexClassId);
                if (apexClasses.has(id)) { // make sure the id is an existing class!
                    // set the scheduled flag to true
                    apexClasses.get(id).isScheduled = true;
                }
            }
        );

        // Part 4- add if class is scheduled
        logger?.log(`Parsing ${apexTestResultRecords.length} test results...`);
        await Processor.forEach(
            apexTestResultRecords,
            (record) => {
                // Get the ID15 of the related test class
                const id = sfdcManager.caseSafeId(record.ApexClassId);
                if (apexClasses.has(id)) { // make sure the id is an existing class
                    const tc = apexClasses.get(id);
                    if (tc.isTest === true) { // make sure this is a Test class!
                        if (!tc.lastTestRunDate) {
                            tc.lastTestRunDate = record.ApexTestRunResult?.CreatedDate;
                            tc.testMethodsRunTime = 0;
                            tc.testPassedButLongMethods = [];
                            tc.testFailedMethods = [];
                        }
                        if (tc.lastTestRunDate === record.ApexTestRunResult?.CreatedDate) {
                            const result = apexTestResultDataFactory.create({ 
                                properties: {
                                    methodName: record.MethodName,
                                    isSuccessful: record.Outcome === 'Pass',
                                    runtime: record.RunTime,
                                    stacktrace: record.StackTrace,
                                }
                            });
                            if (record.ApexTestResults?.records && record.ApexTestResults.records.length > 0) {
                                const limit = record.ApexTestResults.records[0];
                                if (limit.Cpu > 0) result.cpuConsumption = limit.Cpu; 
                                if (limit.AsyncCalls > 0) result.asyncCallsConsumption = limit.AsyncCalls;
                                if (limit.Sosl > 0) result.soslConsumption = limit.Sosl;
                                if (limit.Soql > 0) result.soqlConsumption = limit.Soql;
                                if (limit.QueryRows > 0) result.queryRowsConsumption = limit.QueryRows;
                                if (limit.DmlRows > 0) result.dmlRowsConsumption = limit.DmlRows;
                                if (limit.Dml > 0) result.dmlConsumption = limit.Dml;
                            }
                            tc.testMethodsRunTime += result.runtime;
                            (result.isSuccessful ? tc.testPassedButLongMethods : tc.testFailedMethods).push(result);
                        }
                    }
                }
            }
        );

        // Compute the score of all items
        await Processor.forEach(apexClasses, (apexClass) => {
            apexClassDataFactory.computeScore(apexClass);
        });

        // Return data as map
        logger?.log(`Done`);
        return apexClasses;
    } 
}

class DatasetApexTriggers extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager
     * @param {DataFactoryIntf} dataFactory
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<Map<string, SFDC_ApexTrigger>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First SOQL query
        logger?.log(`Querying Tooling API about ApexTrigger in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            string: 'SELECT Id, Name, ApiVersion, Status, ' +
                        'NamespacePrefix, Body, ' +
                        'UsageBeforeInsert, UsageAfterInsert, ' +
                        'UsageBeforeUpdate, UsageAfterUpdate, ' +
                        'UsageBeforeDelete, UsageAfterDelete, ' +
                        'UsageAfterUndelete, UsageIsBulk, ' +
                        'LengthWithoutComments, ' +
                        'EntityDefinition.QualifiedApiName, ' +
                        'CreatedDate, LastModifiedDate ' +
                    'FROM ApexTrigger ' +
                    `WHERE ManageableState IN ('installedEditable', 'unmanaged') `,
            tooling: true
        }], logger);

        // Init the factory and records
        const apexTriggerDataFactory = dataFactory.getInstance(SFDC_ApexTrigger);
        const apexTriggerRecords = results[0];

        // Then retreive dependencies
        logger?.log(`Retrieving dependencies of ${apexTriggerRecords.length} apex triggers...`);
        const apexTriggersDependencies = await sfdcManager.dependenciesQuery(
            await Processor.map(apexTriggerRecords, (record) => sfdcManager.caseSafeId(record.Id)), 
            logger
        );

        // Create the map
        logger?.log(`Parsing ${apexTriggerRecords.length} apex triggers...`);
        const apexTriggers = new Map(await Processor.map(
            apexTriggerRecords,
            (record) => {

                // Get the ID15
                const id = sfdcManager.caseSafeId(record.Id);

                // Create the instance
                const apexTrigger = apexTriggerDataFactory.create({
                    properties: {
                        id: id,
                        name: record.Name,
                        apiVersion: record.ApiVersion,
                        package: (record.NamespacePrefix || ''),
                        length: record.LengthWithoutComments,
                        isActive: (record.Status === 'Active' ? true : false),
                        beforeInsert: record.UsageBeforeInsert,
                        afterInsert: record.UsageAfterInsert,
                        beforeUpdate: record.UsageBeforeUpdate,
                        afterUpdate: record.UsageAfterUpdate,
                        beforeDelete: record.UsageBeforeDelete,
                        afterDelete: record.UsageAfterDelete,
                        afterUndelete: record.UsageAfterUndelete,
                        objectId: sfdcManager.caseSafeId(record.EntityDefinition?.QualifiedApiName),
                        hasSOQL: false,
                        hasDML: false,
                        createdDate: record.CreatedDate,
                        lastModifiedDate: record.LastModifiedDate,
                        url: sfdcManager.setupUrl(id, SalesforceMetadataTypes.APEX_TRIGGER, record.EntityDefinition?.QualifiedApiName)
                    }, 
                    dependencies: {
                        data: apexTriggersDependencies
                    }
                });
                
                // Get information directly from the source code (if available)
                if (record.Body) {
                    const sourceCode = CodeScanner.RemoveComments(record.Body);
                    apexTrigger.hasSOQL = CodeScanner.HasSOQL(sourceCode); 
                    apexTrigger.hasDML = CodeScanner.HasDML(sourceCode); 
                    apexTrigger.hardCodedURLs = CodeScanner.FindHardCodedURLs(sourceCode);
                    apexTrigger.hardCodedIDs = CodeScanner.FindHardCodedIDs(sourceCode);
                }

                // Compute the score of this item
                apexTriggerDataFactory.computeScore(apexTrigger);

                // Add it to the map  
                return [ apexTrigger.id, apexTrigger ];
            },
            (record)=> (record.EntityDefinition ? true : false)
        ));

        // Return data as map
        logger?.log(`Done`);
        return apexTriggers;
    } 
}

class DatasetUserRoles extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager
     * @param {DataFactoryIntf} dataFactory
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<Map<string, SFDC_UserRole>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First SOQL query
        logger?.log(`Querying REST API about UserRole in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            string: 'SELECT Id, DeveloperName, Name, ParentRoleId, ' +
                        '(SELECT Id FROM Users WHERE IsActive = true AND ContactId = NULL AND Profile.Id != NULL) ' + // only active internal users
                    'FROM UserRole '+
                    `WHERE PortalType = 'None' ` // only internal roles
        }], logger);

        // Init the factory and records
        const userRoleDataFactory = dataFactory.getInstance(SFDC_UserRole);

        // Create the map
        const userRoleRecords = results[0];
        logger?.log(`Parsing ${userRoleRecords.length} user roles...`);
        const childrenByParent = new Map();
        const roots = [];
        const roles = new Map(await Processor.map(userRoleRecords, async (record) => {

            // Get the ID15 of this custom label
            const id = sfdcManager.caseSafeId(record.Id);

            // Create the instance
            const userRole = userRoleDataFactory.create({
                properties: {
                    id: id,
                    name: record.Name,
                    apiname: record.DeveloperName,
                    parentId: record.ParentRoleId ? sfdcManager.caseSafeId(record.ParentRoleId) : undefined,
                    hasParent: record.ParentRoleId ? true : false,
                    activeMembersCount: 0,
                    activeMemberIds: [],
                    hasActiveMembers: false,
                    url: sfdcManager.setupUrl(id, SalesforceMetadataTypes.ROLE)
                }
            });
            // manage kids/parent relationship
            if (userRole.hasParent === false) {
                roots.push(userRole);
            } else {
                if (childrenByParent.has(userRole.parentId) === false) {
                    childrenByParent.set(userRole.parentId, []);
                }
                childrenByParent.get(userRole.parentId).push(userRole);
            }
            // compute the numbers of users
            await Processor.forEach(
                record?.Users?.records, 
                (user) => {
                    userRole.activeMemberIds.push(sfdcManager.caseSafeId(user.Id));
                }
            );
            userRole.activeMembersCount = userRole.activeMemberIds.length;
            userRole.hasActiveMembers = userRole.activeMemberIds.length > 0;

            // Add it to the map  
            return [ userRole.id, userRole ];
        }));

        // Compute levels 
        await Processor.forEach(roots, async (root) => {
            root.level = 1;
            RECURSIVE_LEVEL_CALCULUS(root, childrenByParent);
        });

        // Then compute the score of roles 
        await Processor.forEach(roles, async (userRole) => {
            userRoleDataFactory.computeScore(userRole);
        });

        // Return data as map
        logger?.log(`Done`);
        return roles;
    } 
}

const RECURSIVE_LEVEL_CALCULUS = (parent, childrenByParent) => {
    const children = childrenByParent.get(parent.id);
    children?.forEach((child) => {
        child.level = parent.level + 1;
        RECURSIVE_LEVEL_CALCULUS(child, childrenByParent);
    });
};

class DatasetFlows extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager
     * @param {DataFactoryIntf} dataFactory
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<Map<string, SFDC_Flow>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First SOQL query
        logger?.log(`Querying Tooling API about FlowDefinition in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            // List all FlowDefinition (on top of flow verions)
            string: 'SELECT Id, MasterLabel, DeveloperName, ApiVersion, Description, ActiveVersionId, ' +
                        'LatestVersionId, CreatedDate, LastModifiedDate ' +
                    'FROM FlowDefinition',
            tooling: true
        }, {
            // List all Flow (attached to a FlowDefintion)
            string: 'SELECT Id, DefinitionId, Status, ProcessType '+
                    'FROM Flow where DefinitionId <> null',
            tooling: true
        }], logger);
            
        // Init the factories
        const flowDefinitionDataFactory = dataFactory.getInstance(SFDC_Flow);
        const flowVersionDataFactory = dataFactory.getInstance(SFDC_FlowVersion);
        const flowDefRecords = results[0];
        const flowRecords = results[1];
        
        // Then retreive dependencies
        logger?.log(`Retrieving dependencies of ${flowDefRecords.length} flow versions...`);
        const flowDependenciesIds = [];
        await Processor.forEach(flowDefRecords, (record) => {
            // Add the ID15 of the most interesting flow version
            flowDependenciesIds.push(sfdcManager.caseSafeId(record.ActiveVersionId ?? record.LatestVersionId));
            // Add the ID15 of the flow definition
            flowDependenciesIds.push(sfdcManager.caseSafeId(record.Id));
        });
        const flowDefinitionsDependencies = await sfdcManager.dependenciesQuery(flowDependenciesIds, logger);
        
        // List of active flows that we need to get information later (with Metadata API)
        const activeFlowIds = [];

        // Create the map
        logger?.log(`Parsing ${flowDefRecords.length} flow definitions...`);
        const flowDefinitions = new Map(await Processor.map(flowDefRecords, (record) => {
        
            // Get the ID15 of this flow definition and others
            const id = sfdcManager.caseSafeId(record.Id);
            const activeVersionId = sfdcManager.caseSafeId(record.ActiveVersionId);
            const latestVersionId = sfdcManager.caseSafeId(record.LatestVersionId);

            // Create the instance
            const flowDefinition = flowDefinitionDataFactory.create({
                    properties: {
                    id: id,
                    name: record.DeveloperName,
                    apiVersion: record.ApiVersion,
                    currentVersionId: activeVersionId ?? latestVersionId,
                    isLatestCurrentVersion: activeVersionId === latestVersionId,
                    isVersionActive: activeVersionId ? true : false,
                    versionsCount: 0,
                    description: record.Description,
                    createdDate: record.CreatedDate,
                    lastModifiedDate: record.LastModifiedDate,
                    url: sfdcManager.setupUrl(id, SalesforceMetadataTypes.FLOW_DEFINITION)
                }, 
                dependencies: {
                    data: flowDefinitionsDependencies,
                    idFields: [ 'id', 'currentVersionId' ]
                }
            });
                
            // Add only the active flow (the ones we want to analyze)
            activeFlowIds.push(flowDefinition.currentVersionId);

            // Add it to the map
            return [ flowDefinition.id, flowDefinition ];
        }));

        // Add count of Flow verions (whatever they are active or not)
        logger?.log(`Parsing ${flowRecords.length} flow versions...`);
        await Processor.forEach(flowRecords, (record) => {
                
            // Get the ID15s of the parent flow definition
            const parentId = sfdcManager.caseSafeId(record.DefinitionId);

            // Get the parent Flow definition
            const flowDefinition = flowDefinitions.get(parentId);

            // Add to the version counter (whatever the status);
            flowDefinition.versionsCount++;
            flowDefinition.type = record.ProcessType;
        });

        // Get information about the previous identified active flows using metadata api
        logger?.log(`Calling Tooling API Composite to get more information about these ${activeFlowIds.length} flow versions...`);
        const records = await sfdcManager.readMetadataAtScale('Flow', activeFlowIds, [ 'UNKNOWN_EXCEPTION' ], logger); // There are GACKs throwing that errors for some flows!

        logger?.log(`Parsing ${records.length} flow versions...`);
        await Processor.forEach(records, async (record)=> {

            // Get the ID15s of this flow version and parent flow definition
            const id = sfdcManager.caseSafeId(record.Id);
            const parentId = sfdcManager.caseSafeId(record.DefinitionId);

            // Create the instance
            const activeFlowVersion = flowVersionDataFactory.create({
                properties: {
                    id: id,
                    name: record.FullName,
                    version: record.VersionNumber,
                    apiVersion: record.ApiVersion,
                    totalNodeCount: ['actionCalls', 'apexPluginCalls', 'assignments',
                                        'collectionProcessors', 'decisions', 'loops',
                                        'orchestratedStages', 'recordCreates', 'recordDeletes',
                                        'recordLookups', 'recordRollbacks', 'recordUpdates',
                                        'screens', 'steps', 'waits'
                                    ].reduce((count, property) => count + record.Metadata[property]?.length || 0, 0),
                    dmlCreateNodeCount: record.Metadata.recordCreates?.length || 0,
                    dmlDeleteNodeCount: record.Metadata.recordDeletes?.length || 0,
                    dmlUpdateNodeCount: record.Metadata.recordUpdates?.length || 0,
                    screenNodeCount: record.Metadata.screens?.length || 0,
                    isActive: record.Status === 'Active',
                    description: record.Description,
                    type: record.ProcessType,
                    runningMode: record.RunInMode,
                    createdDate: record.CreatedDate,
                    lastModifiedDate: record.LastModifiedDate,
                    url: sfdcManager.setupUrl(id, SalesforceMetadataTypes.FLOW_VERSION)
                }
            });
            await Processor.forEach(
                record.Metadata.processMetadataValues,
                (m) => {
                    if (m.name === 'ObjectType') activeFlowVersion.sobject = m.value.stringValue;
                    if (m.name === 'TriggerType') activeFlowVersion.triggerType = m.value.stringValue;
                }
            );

            // Get the parent Flow definition
            const flowDefinition = flowDefinitions.get(parentId);

            // Set reference only to the active flow
            flowDefinition.currentVersionRef = activeFlowVersion;
        });

        // Compute the score of all definitions
        await Processor.forEach(flowDefinitions, (flowDefinition) => flowDefinitionDataFactory.computeScore(flowDefinition));

        // Return data as map
        logger?.log(`Done`);
        return flowDefinitions;
    } 
}

class DatasetWorkflows extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager
     * @param {DataFactoryIntf} dataFactory
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<Map<string, SFDC_Workflow>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First SOQL query
        // (only ids because metadata can't be read via SOQL in bulk!
        logger?.log(`Querying Tooling API about WorkflowRule in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            string: 'SELECT Id FROM WorkflowRule',
            tooling: true
        }], logger);
        
        // List of flow ids
        const workflowRuleRecords = results[0];
        logger?.log(`Parsing ${workflowRuleRecords.length} Workflow Rules...`);
        const workflowRuleIds = await Processor.map(workflowRuleRecords, (record) => record.Id);

        // Init the factory and records
        const workflowDataFactory = dataFactory.getInstance(SFDC_Workflow);

        // Get information about flows and process builders using metadata
        logger?.log(`Calling Tooling API Composite to get more information about these ${workflowRuleIds.length} workflow rules...`);
        const records = await sfdcManager.readMetadataAtScale('WorkflowRule', workflowRuleIds, [ 'UNKNOWN_EXCEPTION' ], logger);

        // Create the map
        logger?.log(`Parsing ${records.length} workflows...`);
        const workflows = new Map(await Processor.map(records, async (record) => {

            // Get the ID15 of this user
            const id = sfdcManager.caseSafeId(record.Id);

            // Create the instance
            const workflow = workflowDataFactory.create({
                properties: {
                    id: id,
                    name: record.FullName,
                    description: record.Metadata.description,
                    isActive: record.Metadata.active,
                    createdDate: record.CreatedDate,
                    lastModifiedDate: record.LastModifiedDate,
                    hasAction: true,
                    futureActions: [],
                    emptyTimeTriggers: [],
                    url: sfdcManager.setupUrl(id, SalesforceMetadataTypes.WORKFLOW_RULE)
                }
            });

            // Add information about direction actions
            const directActions = record.Metadata.actions;
            workflow.actions = await Processor.map(
                directActions,
                (action) => { return { name: action.name, type: action.type } }
            );

            // Add information about time triggered actions
            const timeTriggers = record.Metadata.workflowTimeTriggers;
            await Processor.forEach(
                timeTriggers, 
                async (tt) => {
                    const field = tt.offsetFromField || 'TriggerDate';
                    if (tt.actions.length === 0) {
                        workflow.emptyTimeTriggers.push({
                            field: field,
                            delay: `${tt.timeLength} ${tt.workflowTimeTriggerUnit}`
                        });
                    } else {
                        await Processor.forEach(
                            tt.actions,
                            (action) => {
                                workflow.futureActions.push({ 
                                    name: action.name, 
                                    type: action.type, 
                                    field: field,
                                    delay: `${tt.timeLength} ${tt.workflowTimeTriggerUnit}` 
                                });
                            }
                        );
                    }
                }
            );

            // Add number of actions (direct or future)
            workflow.hasAction = (workflow.actions.length + workflow.futureActions.length > 0);

            // Compute the score of this item
            workflowDataFactory.computeScore(workflow);

            // Add it to the map  
            return [ workflow.id, workflow ];
        }));

        // Return data as map
        logger?.log(`Done`);
        return workflows;
    } 
}

/**
 * @description Checks if an instance extends a specific class (not necessary the direct class)
 * @param {any} instanceClass
 * @param {any} masterClass
 * @returns true if the given instance estends somehow the given class
 * @private
 */
const IS_CLASS_EXTENDS = (instanceClass, masterClass) => { 
    return Object.prototype.isPrototypeOf.call(masterClass, instanceClass);
};

/**
 * @description Data factory implementation
 * @public
 */
class DataFactory extends DataFactoryIntf {

    /**
     * @description Map of all factory instances given their "SFDC_*"" class
     * @type {Map}
     * @private
     */
    _instances;

    /**
     * @description Constructor
     * @public
     */
    constructor() {
        super();
        this._instances = new Map();
    }

    /**
     * @see DataFactoryIntf.getInstance
     * @param {any} dataClass 
     * @returns {DataFactoryInstanceIntf}
     */
    getInstance(dataClass) {
        const isDataWithScoring = IS_CLASS_EXTENDS(dataClass, Data);
        const isDataWithDependencies = IS_CLASS_EXTENDS(dataClass, DataWithDependencies);
        const isDataWithoutScoring = IS_CLASS_EXTENDS(dataClass, DataWithoutScoring);
        // Checking dataClass
        if (isDataWithScoring === false && isDataWithoutScoring === false && isDataWithDependencies === false) {
            throw new TypeError('Given dataClass does not extends Data nor DataWithDependencies nor DataWithoutScoring');
        }
        // If this dataClass was never asked before, create it and store it in the cache
        if (this._instances.has(dataClass) === false) {
            this._instances.set(dataClass, new DataFactoryInstance(
                dataClass, 
                isDataWithScoring ? SecretSauce.AllScoreRules.filter(v => v.applicable?.includes(dataClass)) : [], 
                isDataWithDependencies
            ));
        }
        // Return the instance
        return this._instances.get(dataClass);
    }
}

/**
 * @description Data factory for a given data class
 * @public
 */
class DataFactoryInstance extends DataFactoryInstanceIntf {

    /**
     * @type {any} 
     * @private
     */
    _dataClass;

    /**
     * @type {Array<ScoreRule>} 
     * @private
     */
    _scoreRules;

    /**
     * @type {boolean} 
     * @private
     */
    _isDependenciesNeeded;

    /**
     * @description Constructor
     * @param {any} dataClass 
     * @param {Array<ScoreRule>} scoreRules 
     * @param {boolean} isDependenciesNeeded 
     */
    constructor(dataClass, scoreRules, isDependenciesNeeded) {
        super();
        this._dataClass = dataClass;
        this._scoreRules = scoreRules;
        this._isDependenciesNeeded = isDependenciesNeeded;
    }

    /**
     * @description Creates a new instance of the given data class without computing the score
     * @param {any} configuration 
     * @returns {any}
     * @throws if configuration is null or configuration.properties is null
     * @public
     */
    create(configuration) {
        // Checks
        if (!configuration) throw new TypeError("Configuration can't be null.");
        if (!configuration.properties) throw new TypeError("Configuration.properties can't be null.");
        // Create a row from the protofype
        const row = new this._dataClass();
        // Copy properties from configuration.properties to object
        // NB: Please note that ONLY the properties explicitely set in the class will be copied to object
        Object.keys(row).forEach((p) => { row[p] = configuration.properties[p]; });
        // We want to make sure no new property is added to the row (there should be only the ones declared in classes!)
        Object.seal(row);
        // For this type if we have at least one Org Check "score rules", then score is needed
        if (this._scoreRules.length > 0) {
            row.score = 0;
            row.badFields = [];
            row.badReasonIds = [];
        }
        // If dependencies are needed...
        if (this._isDependenciesNeeded === true && configuration.dependencies) {
            row.dependencies = DataDependenciesFactory.create(configuration.dependencies.data, (configuration.dependencies.idFields || ['id']).map(f => row[f]));
        }
        // Return the row finally
        return row;
    }

    /**
     * @description Computes the score on an existing row
     * @param {any} row 
     * @returns {any}
     * @public
     */
    computeScore(row) { 
        this._scoreRules.filter(v => { 
            try { 
                if (v.formula(row) === true) return true;
            } catch (error) { 
                console.error('COMPUTE SCORE', error, row); 
            }
            return false;
        }).forEach(v => {
            row.score++;
            row.badFields.push(v.badField);
            row.badReasonIds.push(v.id);
        });
        return row;
    }

    /**
     * @description Creates a new instance of the given data class AND computes the score
     * @param {any} configuration 
     * @returns {any}
     * @throws if configuration is null or configuration.properties is null
     * @public
     */
    createWithScore(configuration) {
        return this.computeScore(this.create(configuration));
    }
}

class DatasetApplications extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager
     * @param {DataFactoryIntf} dataFactory
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<Map<string, SFDC_Application>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First SOQL query
        logger?.log(`Querying REST API about Applications (tab set typed) in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            string: 'SELECT ApplicationId, Name, Label, NamespacePrefix '+
                    'FROM AppMenuItem ' +
                    'WHERE Type = \'TabSet\' '
        }], logger);

        // Init the factory and records
        const applicationDataFactory = dataFactory.getInstance(SFDC_Application);
        const applicationRecords = results[0];

        // Create the map
        logger?.log(`Parsing ${applicationRecords.length} applications...`);
        const applications = new Map(await Processor.map(applicationRecords, (record) => {

            // Get the ID15 of this application
            const id = sfdcManager.caseSafeId(record.ApplicationId);

            // Create the instance
            const application = applicationDataFactory.create({
                properties: {
                    id: id,
                    name: record.Name, 
                    label: record.Label, 
                    package: (record.NamespacePrefix || '')
                }
            });

            // Add the app in map
            return [ id, application ];
        }));

        // Return data as map
        logger?.log(`Done`);
        return applications;
    }
}

class DatasetFieldPermissions extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager
     * @param {DataFactoryIntf} dataFactory
     * @param {SimpleLoggerIntf} logger
     * @param {Map} parameters
     * @returns {Promise<Map<string, SFDC_FieldPermission>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger, parameters) {

        const fullObjectApiName = parameters?.get('object');

        // First SOQL query
        logger?.log(`Querying REST API about SetupEntityAccess for TabSet in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            string: 'SELECT Field, PermissionsRead, PermissionsEdit, ParentId, Parent.IsOwnedByProfile, Parent.ProfileId ' +
                    'FROM FieldPermissions '+
                    `WHERE SObjectType = '${fullObjectApiName}' `
        }], logger);

        // Init the factory and records
        const fieldPermissionDataFactory = dataFactory.getInstance(SFDC_FieldPermission);
        const permissions = results[0];

        // Create the map
        logger?.log(`Parsing ${permissions.length} Field Permissions...`);
        const fieldPermissions = new Map(await Processor.map(permissions, 
            (record) => {
                // Get the ID15 of this parent
                const parentId = sfdcManager.caseSafeId(record.Parent.IsOwnedByProfile ? record.Parent.ProfileId : record.ParentId);

                // Get only the name of the field without the object name (and by the way without dot
                const indeOfDot = record.Field.indexOf('.');
                const fieldName = indeOfDot === -1 ? record.Field : record.Field.substring(indeOfDot + 1);

                // Create the instance
                const fieldPermission = fieldPermissionDataFactory.create({
                    properties: {
                        fieldApiName: fieldName,
                        parentId: parentId,
                        isRead: record.PermissionsRead,
                        isEdit: record.PermissionsEdit
                    }
                });

                // Add the app in map
                return [ `${record.Field}-${parentId}`, fieldPermission ];
            }
        ));

        // Return data as map
        logger?.log(`Done`);
        return fieldPermissions;
    }
}

class DatasetValidationRules extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager
     * @param {DataFactoryIntf} dataFactory
     * @param {SimpleLoggerIntf} logger List of optional argument to pass
     * @returns {Promise<Map<string, SFDC_ValidationRule>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First SOQL query
        logger?.log(`Querying Tooling API about Validaiton Rules in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            string: 'SELECT Id, Active, Description, ErrorDisplayField, ErrorMessage, '+
                        'ValidationName, EntityDefinition.QualifiedApiName, NamespacePrefix, '+
                        'CreatedDate, LastModifiedDate '+
                    'FROM ValidationRule',
            tooling: true
        }], logger);

        // Init the factory and records
        const validationRuleDataFactory = dataFactory.getInstance(SFDC_ValidationRule);

        // Create the map
        const validationRuleRecords = results[0];
        logger?.log(`Parsing ${validationRuleRecords.length} validation rules...`);
        const validationRules = new Map(await Processor.map(validationRuleRecords, async (record) => {
        
            // Get the ID15 of this validaiton rule
            const id = sfdcManager.caseSafeId(record.Id);

            // Create the instance
            const validationRule = validationRuleDataFactory.createWithScore({
                properties: {
                    id: sfdcManager.caseSafeId(id), 
                    name: record.ValidationName, 
                    isActive: record.Active,
                    package: (record.NamespacePrefix || ''),
                    description: record.Description,
                    errorDisplayField: record.ErrorDisplayField,
                    errorMessage: record.ErrorMessage,
                    objectId: record.EntityDefinition?.QualifiedApiName,
                    createdDate: record.CreatedDate,
                    lastModifiedDate: record.LastModifiedDate, 
                    url: sfdcManager.setupUrl(id, SalesforceMetadataTypes.VALIDATION_RULE)
                }
            });

            // Add it to the map  
            return [ validationRule.id, validationRule ];
        }));

        // Return data as map
        logger?.log(`Done`);
        return validationRules;
    } 
}

class DatasetPermissionSetLicenses extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager
     * @param {DataFactoryIntf} dataFactory
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<Map<string, SFDC_PermissionSetLicense>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First SOQL queries
        logger?.log(`Querying REST API about PermissionSetLicenses in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            string: 'SELECT Id, MasterLabel, CreatedDate, LastModifiedDate, '+
                        'TotalLicenses, Status, ExpirationDate, UsedLicenses, IsAvailableForIntegrations '+
                    'FROM PermissionSetLicense '
        }, {
            string: 'SELECT Id, LicenseId '+ 
                    'FROM PermissionSet '+
                    'WHERE IsOwnedByProfile = false '+
                    'AND LicenseId <> NULL '
        }, {
            string: 'SELECT AssigneeId, PermissionSet.LicenseId ' +
                    'FROM PermissionSetAssignment ' +
                    'WHERE Assignee.IsActive = TRUE ' +
                    'AND PermissionSet.LicenseId <> NULL '+
                    'AND PermissionSet.IsOwnedByProfile = FALSE ' +
                    'ORDER BY PermissionSetId '
        }], logger);

        // Init the factory and records
        const permissionSetLicenseDataFactory = dataFactory.getInstance(SFDC_PermissionSetLicense);
        const permissionSetLicenseRecords = results[0];
        const permissionSetsWithLicenseRecords = results[1];
        const assigneePermSetsWithLicenseRecords = results[2];

        // Create the map
        logger?.log(`Parsing ${permissionSetLicenseRecords.length} permission sets licenses...`);
        const permissionSetLicenses = new Map(await Processor.map(permissionSetLicenseRecords, (record) => {

            // Get the ID15
            const id = sfdcManager.caseSafeId(record.Id);
        
            // Create the instance
            const permissionSetLicense = permissionSetLicenseDataFactory.create({
                properties: {
                    id: id,
                    name: record.MasterLabel,
                    createdDate: record.CreatedDate, 
                    lastModifiedDate: record.LastModifiedDate, 
                    totalCount: record.TotalLicenses, 
                    usedCount: record.UsedLicenses,
                    usedPercentage: record.TotalLicenses !== 0 ? record.UsedLicenses / record.TotalLicenses : undefined,
                    remainingCount: record.TotalLicenses - record.UsedLicenses,
                    permissionSetIds: [],
                    distinctActiveAssigneeCount: 0,
                    status: record.Status, 
                    expirationDate: record.ExpirationDate, 
                    isAvailableForIntegrations: record.IsAvailableForIntegrations,
                    url: sfdcManager.setupUrl(id, SalesforceMetadataTypes.PERMISSION_SET_LICENSE)
                }
            });

            // Add it to the map  
            return [ permissionSetLicense.id, permissionSetLicense ];
        }));

        logger?.log(`Parsing ${assigneePermSetsWithLicenseRecords.length} Permission Sets with a link to a License...`);    
        const assigneePermSetLicense = new Map();    
        await Processor.forEach(assigneePermSetsWithLicenseRecords, (record) => {
            if (record.PermissionSet && record.PermissionSet.LicenseId && record.PermissionSet.LicenseId.startsWith('0PL')) {
                const licenseId = sfdcManager.caseSafeId(record.PermissionSet.LicenseId);
                const assigneeId = sfdcManager.caseSafeId(record.AssigneeId);
                if (assigneePermSetLicense.has(licenseId) === false) {
                    assigneePermSetLicense.set(licenseId, new Set());
                }
                assigneePermSetLicense.get(licenseId).add(assigneeId);
                permissionSetLicenses.get(licenseId).distinctActiveAssigneeCount = assigneePermSetLicense.get(licenseId).size;
            }
        });

        logger?.log(`Parsing ${permissionSetsWithLicenseRecords.length} Permission Sets with a link to a License...`);
        await Processor.forEach(permissionSetsWithLicenseRecords, (record) => {
            const permissionSetId = sfdcManager.caseSafeId(record.Id);
            const licenseId = sfdcManager.caseSafeId(record.LicenseId);
            if (permissionSetLicenses.has(licenseId)) {
                permissionSetLicenses.get(licenseId).permissionSetIds.push(permissionSetId);
            }
        });

        // Compute scores for all permission set licenses
        logger?.log(`Computing the score for ${permissionSetLicenses.size} permission set licenses...`);
        await Processor.forEach(permissionSetLicenses, (record) => {
            permissionSetLicenseDataFactory.computeScore(record);
        });
        
        // Return data as map
        logger?.log(`Done`);
        return permissionSetLicenses;
    } 
}

class DatasetPageLayouts extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager
     * @param {DataFactoryIntf} dataFactory
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<Map<string, SFDC_PageLayout>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First SOQL queries
        logger?.log(`Querying Tooling API about Layout and ProfileLayout in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            tooling: true,
            string: 'SELECT Id, Name, NamespacePrefix, LayoutType, EntityDefinition.QualifiedApiName, '+
                        'CreatedDate, LastModifiedDate ' +
                    'FROM Layout '
        }, {
            tooling: true,
            string: 'SELECT LayoutId, COUNT(ProfileId) CountAssignment '+
                    'FROM ProfileLayout '+
                    'WHERE Profile.Name != null ' +
                    'GROUP BY LayoutId ',
            queryMoreField: 'CreatedDate'
        }], logger);

        // Init the factory and records
        const pageLayoutDataFactory = dataFactory.getInstance(SFDC_PageLayout);

        // Create the map
        const pageLayoutRecords = results[0];
        const pageLayoutProfileAssignRecords = results[1];

        logger?.log(`Parsing ${pageLayoutRecords.length} page layouts...`);
        const pageLayouts = new Map(await Processor.map(pageLayoutRecords, (record) => {

            // Get the ID15 of this page layout
            const id = sfdcManager.caseSafeId(record.Id);

            // Create the instance
            const pageLayout = pageLayoutDataFactory.create({
                properties: {
                    id: id,
                    name: record.Name,
                    package: (record.NamespacePrefix || ''),
                    objectId: record.EntityDefinition?.QualifiedApiName,
                    type: record.LayoutType,
                    profileAssignmentCount: 0,
                    createdDate: record.CreatedDate, 
                    lastModifiedDate: record.LastModifiedDate,
                    url: sfdcManager.setupUrl(id, SalesforceMetadataTypes.PAGELAYOUT)
                }
            });

            // Add it to the map  
            return [ pageLayout.id, pageLayout ];

        }, (record) => { 
            if (!record.EntityDefinition) return false; // ignore if no EntityDefinition linked
            return true;
        }));

        logger?.log(`Parsing ${pageLayoutProfileAssignRecords.length} page layout assignment counts...`);
        await Processor.forEach(pageLayoutProfileAssignRecords, (record) => {

            // Get the ID15 of this page layout
            const id = sfdcManager.caseSafeId(record.LayoutId);

            if (pageLayouts.has(id)) {
                // Get the page layout
                const pageLayout = pageLayouts.get(id);

                // Set the assignment count
                pageLayout.profileAssignmentCount += record.CountAssignment;
            }
        });

        // Compute the score of all items
        await Processor.forEach(pageLayouts, (pageLayout) => {
            pageLayoutDataFactory.computeScore(pageLayout);
        });

        // Return data as map
        logger?.log(`Done`);
        return pageLayouts;
    } 
}

/**
 * @description Dataset manager
 */
class DatasetManager extends DatasetManagerIntf {
    
    /**
     * @description List of datasets
     * @type {Map<string, Dataset>} 
     * @private
     */
    _datasets;

    /**
     * @description Datasets promise cache
     * @type {Map<string, Promise>}
     * @private
     */
    _datasetPromisesCache;

    /**
     * @description Data cache manager
     * @type {DataCacheManagerIntf}
     * @private
     */
    _dataCache;

    /**
     * @description Salesforce manager
     * @type {SalesforceManagerIntf}
     * @private
     */
    _sfdcManager;

    /**
     * @description Logger
     * @type {LoggerIntf}
     * @private
     */
    _logger;

    /**
     * @description Data factory
     * @type {DataFactoryIntf}}
     * @private
     */
    _dataFactory;

    /**
     * @description Dataset Manager constructor
     * @param {SalesforceManagerIntf} sfdcManager 
     * @param {DataCacheManagerIntf} cacheManager
     * @param {LoggerIntf} logger
     * @public
     */
    constructor(sfdcManager, cacheManager, logger) {
        super();
        
        if (sfdcManager instanceof SalesforceManagerIntf === false) {
            throw new TypeError('The given sfdcManager is not an instance of SalesforceManagerIntf.');
        }
        if (logger instanceof LoggerIntf === false) {
            throw new TypeError('The given logger is not an instance of LoggerIntf.');
        }
        
        this._sfdcManager = sfdcManager;
        this._logger = logger;
        this._dataCache = cacheManager;
        this._datasets = new Map();
        this._datasetPromisesCache = new Map();
        this._dataFactory = new DataFactory();

        this._datasets.set(DatasetAliases.APEXCLASSES, new DatasetApexClasses());
        this._datasets.set(DatasetAliases.APEXTRIGGERS, new DatasetApexTriggers());
        this._datasets.set(DatasetAliases.APPLICATIONS, new DatasetApplications());
        this._datasets.set(DatasetAliases.APPPERMISSIONS, new DatasetAppPermissions());
        this._datasets.set(DatasetAliases.CURRENTUSERPERMISSIONS, new DatasetCurrentUserPermissions());
        this._datasets.set(DatasetAliases.CUSTOMFIELDS, new DatasetCustomFields());
        this._datasets.set(DatasetAliases.CUSTOMLABELS, new DatasetCustomLabels());
        this._datasets.set(DatasetAliases.FIELDPERMISSIONS, new DatasetFieldPermissions());
        this._datasets.set(DatasetAliases.FLOWS, new DatasetFlows());
        this._datasets.set(DatasetAliases.GROUPS, new DatasetGroups());
        this._datasets.set(DatasetAliases.LIGHTNINGAURACOMPONENTS, new DatasetLightningAuraComponents());
        this._datasets.set(DatasetAliases.LIGHTNINGPAGES, new DatasetLightningPages());
        this._datasets.set(DatasetAliases.LIGHTNINGWEBCOMPONENTS, new DatasetLightningWebComponents());
        this._datasets.set(DatasetAliases.OBJECT, new DatasetObject());
        this._datasets.set(DatasetAliases.OBJECTPERMISSIONS, new DatasetObjectPermissions());
        this._datasets.set(DatasetAliases.OBJECTS, new DatasetObjects());
        this._datasets.set(DatasetAliases.OBJECTTYPES, new DatasetObjectTypes());
        this._datasets.set(DatasetAliases.ORGANIZATION, new DatasetOrganization());
        this._datasets.set(DatasetAliases.PACKAGES, new DatasetPackages());
        this._datasets.set(DatasetAliases.PAGELAYOUTS, new DatasetPageLayouts());
        this._datasets.set(DatasetAliases.PERMISSIONSETS, new DatasetPermissionSets());
        this._datasets.set(DatasetAliases.PERMISSIONSETLICENSES, new DatasetPermissionSetLicenses());
        this._datasets.set(DatasetAliases.PROFILEPWDPOLICIES, new DatasetProfilePasswordPolicies());
        this._datasets.set(DatasetAliases.PROFILERESTRICTIONS, new DatasetProfileRestrictions());
        this._datasets.set(DatasetAliases.PROFILES, new DatasetProfiles());
        this._datasets.set(DatasetAliases.USERROLES, new DatasetUserRoles());
        this._datasets.set(DatasetAliases.USERS, new DatasetUsers());
        this._datasets.set(DatasetAliases.VALIDATIONRULES, new DatasetValidationRules());
        this._datasets.set(DatasetAliases.VISUALFORCECOMPONENTS, new DatasetVisualForceComponents());
        this._datasets.set(DatasetAliases.VISUALFORCEPAGES, new DatasetVisualForcePages());
        this._datasets.set(DatasetAliases.WORKFLOWS, new DatasetWorkflows());
    }

    /**
     * @description Run the given list of datasets and return them as a result
     * @param {Array<string | DatasetRunInformation>} datasets 
     * @returns {Promise<Map>}
     * @public
     * @async
     */
    async run(datasets) {
        if (datasets instanceof Array === false) {
            throw new TypeError('The given datasets is not an instance of Array.');
        }
        return new Map((await Promise.all(datasets.map((dataset) => {
            const alias      = (typeof dataset === 'string' ? dataset : dataset.alias);
            const cacheKey   = (typeof dataset === 'string' ? dataset : dataset.cacheKey);
            const parameters = (typeof dataset === 'string' ? undefined : dataset.parameters);
            const section = `DATASET ${alias}`;
            if (this._datasetPromisesCache.has(cacheKey) === false) {
                this._datasetPromisesCache.set(cacheKey, new Promise((resolve, reject) => {
                    this._logger.log(section, `Checking the data cache for key=${cacheKey}...`);
                    // Check data cache if any
                    if (this._dataCache.has(cacheKey) === true) {
                        // Set the results from data cache
                        this._logger.ended(section, 'There was data in data cache, we use it!');
                        // Return the key/alias and value from the data cache
                        resolve([ alias, this._dataCache.get(cacheKey) ]); // when data comes from cache instanceof won't work! (keep that in mind)
                    } else {
                        this._logger.log(section, `There was no data in data cache. Let's retrieve data.`);
                        // Calling the retriever
                        this._datasets.get(alias).run(
                            // sfdc manager
                            this._sfdcManager,
                            // data factory
                            this._dataFactory,
                            // local logger
                            this._logger.toSimpleLogger(section),
                            // Send any parameters if needed
                            parameters
                        ).then((data) => {
                            // Cache the data (if possible and not too big)
                            this._dataCache.set(cacheKey, data); 
                            // Some logs
                            this._logger.ended(section, `Data retrieved and saved in cache with key=${cacheKey}`);
                            // Return the key/alias and value from the cache
                            resolve([ alias, data ]);
                        }).catch((error) => {
                            // Reject with this error
                            this._logger.failed(section, error);
                            reject(error);
                        });
                    }
                }));
            }
            return this._datasetPromisesCache.get(cacheKey);
        }))));
    }

    /**
     * @description Clean the given list of datasets from cache (if present)
     * @param {Array<string | DatasetRunInformation>} datasets 
     * @public
     */
    clean(datasets) {
        if (datasets instanceof Array === false) {
            throw new TypeError('The given datasets is not an instance of Array.');
        }
        datasets.forEach((dataset) => {
            const cacheKey = (typeof dataset === 'string' ? dataset : dataset.cacheKey);
            this._dataCache.remove(cacheKey);
            this._datasetPromisesCache.delete(cacheKey);
        });
    }
}

const LOG_OPERATION_IN_PROGRESS = 0;
const LOG_OPERATION_DONE = 1;
const LOG_OPERATION_FAILED = 2;

/**
 * @description Logger for  
 */ 
class Logger extends LoggerIntf {

    /**
     * @description Logger gets an injected logger :)
     * @type {BasicLoggerIntf}
     * @private
     */
    _logger;

    /**
     * @description Operation names that are/were logged
     * @type {Map<string, number>}}
     * @private
     */
    _operationNames;

    /**
     * @description Count of successful operations
     * @type {number}
     * @private
     */
    _countSuccesses;

    /**
     * @description Count of failed operations
     * @type {number}
     * @private
     */
    _countFailures;

    /**
     * @description Constructor
     * @param {BasicLoggerIntf} logger 
     */
    constructor(logger) {
        super();
        this._logger = logger;
        this._countSuccesses = 0;
        this._countFailures = 0;
        this._operationNames = new Map();
    }

    /**
     * @see LoggerIntf.log
     * @param {string} operationName
     * @param {string} [message] 
     */
    log(operationName, message) { 
        CONSOLE_LOG(operationName, 'LOG', message);
        this._logger?.log(operationName, message);
        this._operationNames.set(operationName, LOG_OPERATION_IN_PROGRESS);
    }

    /**
     * @see LoggerIntf.ended
     * @param {string} operationName
     * @param {string} [message] 
     */
    ended(operationName, message) { 
        CONSOLE_LOG(operationName, 'ENDED', message);
        this._countSuccesses++;
        this._logger?.ended(operationName, message);
        this._operationNames.set(operationName, LOG_OPERATION_DONE);
    }

    /**
     * @see LoggerIntf.failed
     * @param {string} operationName
     * @param {Error | string} [error] 
     * @public
     */
    failed(operationName, error) { 
        CONSOLE_LOG(operationName, 'FAILED', error);
        this._countFailures++;
        this._logger?.failed(operationName, error);
        this._operationNames.set(operationName, LOG_OPERATION_FAILED);
    }

    /**
     * @description Turn this logger into a simple logger for a specific section
     * @param {string} operationName
     * @returns {SimpleLoggerIntf}
     */ 
    toSimpleLogger(operationName) {
        const internalLogger = this._logger;
        return { 
            log: (message) => { 
                CONSOLE_LOG(operationName, 'LOG', message);
                internalLogger?.log(operationName, message);
            },
            debug: (message) => { 
                CONSOLE_LOG(operationName, 'DEBUG', message);
            }
        };
    }
}

/**
 * @description Logs the end of this section
 * @param {string} operationName
 * @param {string} event 
 * @param {string | Error} [message='...']
 */
const CONSOLE_LOG = (operationName, event, message='...') => { 
    console.error(`${new Date().toISOString()} - ${operationName} - ${event} - ${message}`); 
};

class RecipeActiveUsers extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {SimpleLoggerIntf} logger
     * @returns {Array<string | DatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [
            DatasetAliases.USERS, 
            DatasetAliases.PROFILES, 
            DatasetAliases.PERMISSIONSETS
        ];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger) {

        // Get data
        const /** @type {Map<string, SFDC_User>} */ users = data.get(DatasetAliases.USERS);
        const /** @type {Map<string, SFDC_Profile>} */ profiles = data.get(DatasetAliases.PROFILES);
        const /** @type {Map<string, SFDC_PermissionSet>} */ permissionSets = data.get(DatasetAliases.PERMISSIONSETS);

        // Checking data
        if (!users) throw new Error(`RecipeActiveUsers: Data from dataset alias 'USERS' was undefined.`);
        if (!profiles) throw new Error(`RecipeActiveUsers: Data from dataset alias 'PROFILES' was undefined.`);
        if (!permissionSets) throw new Error(`RecipeActiveUsers: Data from dataset alias 'PERMISSIONSETS' was undefined.`);

        // Augment data
        await Processor.forEach(users, async (user) => {
            user.profileRef = profiles.get(user.profileId);
            user.permissionSetRefs = await Processor.map(
                user.permissionSetIds,
                (/** @type {string} */ id) => permissionSets.get(id),
                (/** @type {string} */ id) => permissionSets.has(id)
            );
            user.aggregateImportantPermissions = {};
            if (user.profileRef?.importantPermissions) {
                Object.keys(user.profileRef.importantPermissions)
                    .filter((permName) => user.profileRef.importantPermissions[permName] === true)
                    .forEach((permName) => { user.aggregateImportantPermissions[permName] = [ user.profileRef ]; });
            }
            await Processor.forEach(user.permissionSetRefs, (/** @type {SFDC_PermissionSet} */ permissionSet) => {
                Object.keys(permissionSet.importantPermissions)
                    .filter((permName) => permissionSet.importantPermissions[permName] === true)
                    .forEach((permName) => { 
                        if (!user.aggregateImportantPermissions[permName]) user.aggregateImportantPermissions[permName] = []; 
                        user.aggregateImportantPermissions[permName].push(permissionSet);
                    });
            });
        });
        // Return data
        return [... users.values()];
    }
}

class RecipeApexClasses extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {SimpleLoggerIntf} logger
     * @returns {Array<string | DatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [
            DatasetAliases.APEXCLASSES
        ];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} logger
     * @param {string} namespace Name of the package (if all use '*')
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger, namespace) {

        // Get data
        const /** @type {Map<string, SFDC_ApexClass>} */ apexClasses = data.get(DatasetAliases.APEXCLASSES);

        // Checking data
        if (!apexClasses) throw new Error(`RecipeApexClasses: Data from dataset alias 'APEXCLASSES' was undefined.`);

        // Augment and filter data
        const array = [];
        await Processor.forEach(apexClasses, async (apexClass) => {            
            // Augment data
            const results = await Promise.all([
                Processor.map(apexClass.relatedTestClassIds, id => apexClasses.get(id)),
                Processor.map(apexClass.relatedClassIds, id => apexClasses.get(id))
            ]);
            apexClass.relatedTestClassRefs = results[0];
            apexClass.relatedClassRefs = results[1];
            // Filter data
            if ((namespace === '*' || apexClass.package === namespace) && apexClass.isTest === false && apexClass.needsRecompilation === false) {
                array.push(apexClass);
            }
        });

        // Return data
        return array;
    }
}

class RecipeApexTriggers extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {SimpleLoggerIntf} logger
     * @returns {Array<string | DatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [
            DatasetAliases.APEXTRIGGERS,
            DatasetAliases.OBJECTS
        ];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} logger
     * @param {string} namespace Name of the package (if all use '*')
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger, namespace) {

        // Get data
        const /** @type {Map<string, SFDC_ApexTrigger>} */ apexTriggers = data.get(DatasetAliases.APEXTRIGGERS);
        const /** @type {Map<string, SFDC_Object>} */ objects = data.get(DatasetAliases.OBJECTS);

        // Checking data
        if (!apexTriggers) throw new Error(`RecipeApexTriggers: Data from dataset alias 'APEXTRIGGERS' was undefined.`);
        if (!objects) throw new Error(`RecipeApexTriggers: Data from dataset alias 'OBJECTS' was undefined.`);

        // Augment and filter data
        const array = [];
        await Processor.forEach(apexTriggers, (apexTrigger) => {
            // Augment data
            apexTrigger.objectRef = objects.get(apexTrigger.objectId);
            // Filter data
            if (namespace === '*' || apexTrigger.package === namespace) {
                array.push(apexTrigger);
            }
        });

        // Return data
        return array;
    }
}

class RecipeAppPermissions extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {SimpleLoggerIntf} logger
     * @returns {Array<string | DatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [
            DatasetAliases.APPLICATIONS,
            DatasetAliases.APPPERMISSIONS,
            DatasetAliases.PROFILES,
            DatasetAliases.PERMISSIONSETS
        ];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} logger
     * @param {string} namespace Name of the package (if all use '*')
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger, namespace) {

        // Get data
        const /** @type {Map<string, SFDC_Application>} */ applications = data.get(DatasetAliases.APPLICATIONS);
        const /** @type {Map<string, SFDC_AppPermission>} */ appPermissions = data.get(DatasetAliases.APPPERMISSIONS);
        const /** @type {Map<string, SFDC_Profile>} */ profiles = data.get(DatasetAliases.PROFILES);
        const /** @type {Map<string, SFDC_PermissionSet>} */ permissionSets = data.get(DatasetAliases.PERMISSIONSETS);

        // Checking data
        if (!applications) throw new Error(`RecipeAppPermissions: Data from dataset alias 'APPLICATIONS' was undefined.`);
        if (!appPermissions) throw new Error(`RecipeAppPermissions: Data from dataset alias 'APPPERMISSIONS' was undefined.`);
        if (!profiles) throw new Error(`RecipeAppPermissions :Data from dataset alias 'PROFILES' was undefined.`);
        if (!permissionSets) throw new Error(`RecipeAppPermissions: Data from dataset alias 'PERMISSIONSETS' was undefined.`);

        // Augment and filter data
        const workingMatrix = DataMatrixFactory.create();
        await Processor.forEach(appPermissions, (ap) => {
            // Augment data
            ap.appRef = applications.get(ap.appId);
            if (ap.parentId.startsWith('0PS') === true) {
                ap.parentRef = permissionSets.get(ap.parentId);
            } else {
                ap.parentRef = profiles.get(ap.parentId);
            }
            // Filter data
            if (namespace === '*' || ap.parentRef.package === namespace || ap.appRef.appPackage === namespace ) {
                if (workingMatrix.hasRowHeader(ap.parentId) === false) {
                    workingMatrix.setRowHeader(ap.parentId, ap.parentRef);
                }
                if (workingMatrix.hasColumnHeader(ap.appId) === false) {
                    workingMatrix.setColumnHeader(ap.appId, ap.appRef);
                }
                workingMatrix.addValueToProperty(
                    ap.parentId,
                    ap.appId,
                    (ap.isAccessible?'A':'') + (ap.isVisible?'V':'')
                );
            }
        });

        // Return data
        return workingMatrix.toDataMatrix();
    }
}

class RecipeCurrentUserPermissions extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {SimpleLoggerIntf} logger
     * @param {Array<string>} permissions List of string to represent the permission you need to retreive
     * @returns {Array<string | DatasetRunInformation>}
     * @public
     */
    extract(logger, permissions) {
        const datasetRunInfo = new DatasetRunInformation(DatasetAliases.CURRENTUSERPERMISSIONS, DatasetAliases.CURRENTUSERPERMISSIONS);
        datasetRunInfo.parameters.set('permissions', permissions);
        return [datasetRunInfo];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger) {

        // Get data
        const /** @type {Map<string, boolean>} */ currentUserPermissions = data.get(DatasetAliases.CURRENTUSERPERMISSIONS);
        
        // Checking data
        if (!currentUserPermissions) throw new Error(`RecipeCurrentUserPermissions: Data from dataset alias 'CURRENTUSERPERMISSIONS' was undefined.`);

        // Return all data
        return currentUserPermissions;
    }
}

class RecipeCustomFields extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {SimpleLoggerIntf} logger
     * @returns {Array<string | DatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [
            DatasetAliases.CUSTOMFIELDS, 
            DatasetAliases.OBJECTTYPES, 
            DatasetAliases.OBJECTS
        ];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} logger
     * @param {string} namespace Name of the package (if all use '*')
     * @param {string} objecttype Name of the type (if all use '*')
     * @param {string} object API name of the object (if all use '*')
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger, namespace, objecttype, object) {

        // Get data
        const /** @type {Map<string, SFDC_ObjectType>} */ types = data.get(DatasetAliases.OBJECTTYPES);
        const /** @type {Map<string, SFDC_Object>} */ objects = data.get(DatasetAliases.OBJECTS);
        const /** @type {Map<string, SFDC_Field>} */ customFields = data.get(DatasetAliases.CUSTOMFIELDS);

        // Checking data
        if (!types) throw new Error(`RecipeCustomFields: Data from dataset alias 'OBJECTTYPES' was undefined.`);
        if (!objects) throw new Error(`RecipeCustomFields: Data from dataset alias 'OBJECTS' was undefined.`);
        if (!customFields) throw new Error(`RecipeCustomFields: Data from dataset alias 'CUSTOMFIELDS' was undefined.`);

        // Augment and filter data
        const array = [];
        await Processor.forEach(customFields, (/** @type {SFDC_Field} */customField) => {
            // Augment data
            const objectRef = objects.get(customField.objectId);
            if (objectRef && !objectRef.typeRef) {
                objectRef.typeRef = types.get(objectRef.typeId);
            }
            customField.objectRef = objectRef;
            // Filter data
            if ((namespace === '*' || customField.package === namespace) &&
                (objecttype === '*' || customField.objectRef?.typeRef?.id === objecttype) &&
                (object === '*' || customField.objectRef?.apiname === object)) {
                array.push(customField);
            }
        });

        // Return data
        return array;
    }
}

class RecipeCustomLabels extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {SimpleLoggerIntf} logger
     * @returns {Array<string | DatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [DatasetAliases.CUSTOMLABELS];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} logger
     * @param {string} namespace Name of the package (if all use '*')
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger, namespace) {

        // Get data
        const /** @type {Map<string, SFDC_CustomLabel>} */ customLabels = data.get(DatasetAliases.CUSTOMLABELS);

        // Checking data
        if (!customLabels) throw new Error(`RecipeCustomLabels: Data from dataset alias 'CUSTOMLABELS' was undefined.`);

        // Filter data
        const array = [];
        await Processor.forEach(customLabels, (customLabel) => {
            if (namespace === '*' || customLabel.package === namespace) {
                array.push(customLabel);
            }
        });

        // Return data
        return array;
    }
}

class RecipeFlows extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {SimpleLoggerIntf} logger
     * @returns {Array<string | DatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [DatasetAliases.FLOWS];
    }

    /**
     * @description transform the data from the datasets and return the final result as an Array
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger) {

        // Get data
        const /** @type {Map<string, SFDC_Flow>} */ flows = data.get(DatasetAliases.FLOWS);

        // Checking data
        if (!flows) throw new Error(`RecipeFlows: Data from dataset alias 'FLOWS' was undefined.`);

        // Filter data
        const array = [];
        await Processor.forEach(flows, (flow) => {
            if (flow.type !== 'Workflow') {
                array.push(flow);
            }
        });

        // Return data
        return array;
    }
}

class RecipeLightningAuraComponents extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {SimpleLoggerIntf} logger
     * @returns {Array<string | DatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [DatasetAliases.LIGHTNINGAURACOMPONENTS];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} logger
     * @param {string} namespace Name of the package (if all use '*')
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger, namespace) {

        // Get data
        const /** @type {Map<string, SFDC_LightningAuraComponent>} */ components = data.get(DatasetAliases.LIGHTNINGAURACOMPONENTS);

        // Checking data
        if (!components) throw new Error(`RecipeLightningAuraComponents: Data from dataset alias 'LIGHTNINGAURACOMPONENTS' was undefined.`);

        // Filter data
        const array = [];
        await Processor.forEach(components, (component) => {
            if (namespace === '*' || component.package === namespace) {
                array.push(component);
            }
        });

        // Return data
        return array;
    }
}

class RecipeLightningPages extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {SimpleLoggerIntf} logger
     * @returns {Array<string | DatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [
            DatasetAliases.LIGHTNINGPAGES,
            DatasetAliases.OBJECTS
        ];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} logger
     * @param {string} namespace Name of the package (if all use '*')
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger, namespace) {

        // Get data
        const /** @type {Map<string, SFDC_LightningPage>} */ pages = data.get(DatasetAliases.LIGHTNINGPAGES);
        const /** @type {Map<string, SFDC_Object>} */ objects = data.get(DatasetAliases.OBJECTS);

        // Checking data
        if (!pages) throw new Error(`RecipeLightningPages: Data from dataset alias 'LIGHTNINGPAGES' was undefined.`);
        if (!objects) throw new Error(`RecipeLightningPages: Data from dataset alias 'OBJECTS' was undefined.`);

        // Augment and filter data
        const array = [];
        await Processor.forEach(pages, (page) => {
            // Augment data
            if (page.objectId) {
                // if objectId was specified in the page, get the reference of the object
                page.objectRef = objects.get(page.objectId);
            }
            // Filter data
            if (namespace === '*' || page.package === namespace) {
                array.push(page);
            }
        });

        // Return data
        return array;
    }
}

class RecipeLightningWebComponents extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {SimpleLoggerIntf} logger
     * @returns {Array<string | DatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [DatasetAliases.LIGHTNINGWEBCOMPONENTS];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} logger
     * @param {string} namespace Name of the package (if all use '*')
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger, namespace) {

        // Get data
        const  /** @type {Map<string, SFDC_LightningWebComponent>} */ components = data.get(DatasetAliases.LIGHTNINGWEBCOMPONENTS);

        // Checking data
        if (!components) throw new Error(`RecipeLightningWebComponents: Data from dataset alias 'LIGHTNINGWEBCOMPONENTS' was undefined.`);

        // Filter data
        const array = [];
        await Processor.forEach(components, (component) => {
            if (namespace === '*' || component.package === namespace) {
                array.push(component);
            }
        });

        // Return data
        return array;
    }
}

class RecipeObject extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {SimpleLoggerIntf} logger
     * @param {string} object Name of the object to describe in this recipe's instance.
     * @returns {Array<string | DatasetRunInformation>}
     * @public
     */
    extract(logger, object) {
        const datasetRunInfoObject = new DatasetRunInformation(DatasetAliases.OBJECT, `${DatasetAliases.OBJECT}_${object}`);
        const datasetRunInfoCustomField = new DatasetRunInformation(DatasetAliases.CUSTOMFIELDS, `${DatasetAliases.CUSTOMFIELDS}_${object}`);
        datasetRunInfoObject.parameters.set('object', object);
        datasetRunInfoCustomField.parameters.set('object', object);
        return [ datasetRunInfoObject, 
            DatasetAliases.OBJECTTYPES,
            DatasetAliases.APEXTRIGGERS,
            DatasetAliases.LIGHTNINGPAGES,
            datasetRunInfoCustomField
        ];
    }

    /**
     * @description transform the data from the datasets and return the final result as an Array
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger) {

        // Get data
        const /** @type {Map<string, SFDC_ObjectType>} */ types = data.get(DatasetAliases.OBJECTTYPES);
        const /** @type {SFDC_Object} */ object = data.get(DatasetAliases.OBJECT);
        const /** @type {Map<string, SFDC_ApexTrigger>} */ apexTriggers = data.get(DatasetAliases.APEXTRIGGERS);
        const /** @type {Map<string, SFDC_LightningPage>} */ pages = data.get(DatasetAliases.LIGHTNINGPAGES);
        const /** @type {Map<string, SFDC_Field>} */ customFields = data.get(DatasetAliases.CUSTOMFIELDS);

        // Checking data
        if (!types) throw new Error(`RecipeObject: Data from dataset alias 'OBJECTTYPES' was undefined.`);
        if (!object) throw new Error(`RecipeObject: Data from dataset alias 'OBJECT' was undefined.`);
        if (!apexTriggers) throw new Error(`RecipeObject: Data from dataset alias 'APEXTRIGGERS' was undefined.`);
        if (!pages) throw new Error(`RecipeObject: Data from dataset alias 'LIGHTNINGPAGES' was undefined.`);
        if (!customFields) throw new Error(`RecipeObject: Data from dataset alias 'CUSTOMFIELDS' was undefined.`);

        // Augment data
        object.typeRef = types.get(object.typeId);
        object.flexiPages = [];
        const result = await Promise.all([
            Processor.map( // returns apexTriggerRefs
                object.apexTriggerIds,
                (id) => { 
                    const apexTrigger = apexTriggers.get(id);
                    apexTrigger.objectRef = object;
                    return apexTrigger;
                },
                (id) => apexTriggers.has(id)
            ),
            Processor.forEach(pages, (page) => {
                if (page.objectId === object.id) {
                    object.flexiPages.push(page);
                }
            }),
            Processor.map( // returns customFieldRefs
                object.customFieldIds,
                (id) => { 
                    const customField = customFields.get(id);
                    customField.objectRef = object;
                    return customField;
                },
                (id) => customFields.has(id)
            )
        ]);
        object.apexTriggerRefs = result[0];
        object.customFieldRefs = result[2];

        // Return data
        return object;
    }
}

class RecipeObjectPermissions extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {SimpleLoggerIntf} logger
     * @returns {Array<string | DatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [
            DatasetAliases.OBJECTPERMISSIONS,
            DatasetAliases.PROFILES,
            DatasetAliases.PERMISSIONSETS
        ];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} logger
     * @param {string} namespace Name of the package (if all use '*')
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger, namespace) {

        // Get data
        const /** @type {Map<string, SFDC_ObjectPermission>} */ objectPermissions = data.get(DatasetAliases.OBJECTPERMISSIONS);
        const /** @type {Map<string, SFDC_Profile>} */ profiles = data.get(DatasetAliases.PROFILES);
        const /** @type {Map<string, SFDC_PermissionSet>} */ permissionSets = data.get(DatasetAliases.PERMISSIONSETS);

        // Checking data
        if (!objectPermissions) throw new Error(`RecipeObjectPermissions: Data from dataset alias 'OBJECTPERMISSIONS' was undefined.`);
        if (!profiles) throw new Error(`RecipeObjectPermissions: Data from dataset alias 'PROFILES' was undefined.`);
        if (!permissionSets) throw new Error(`RecipeObjectPermissions: Data from dataset alias 'PERMISSIONSETS' was undefined.`);

        // Augment and Filter data
        const workingMatrix = DataMatrixFactory.create();
        /** @type {Map<string, SFDC_Profile | SFDC_PermissionSet>} */
        await Processor.forEach(objectPermissions, (op) => {
            // Augment data
            if (op.parentId.startsWith('0PS') === true) {
                op.parentRef = permissionSets.get(op.parentId);
            } else {
                op.parentRef = profiles.get(op.parentId);
            }
            // Filter data
            if (namespace === '*' || op.parentRef.package === namespace) {
                if (workingMatrix.hasRowHeader(op.parentId) === false) {
                    workingMatrix.setRowHeader(op.parentId, op.parentRef);
                }
                // Column header: key and value are same so not needed!
                /* if (workingMatrix.hasColumnHeader(op.objectType) === false) {
                    workingMatrix.setColumnHeader(op.objectType, op.objectType);
                } */
                workingMatrix.addValueToProperty(
                    op.parentId,
                    op.objectType,
                    (op.isCreate?'C':'')+(op.isRead?'R':'')+(op.isEdit?'U':'')+(op.isDelete?'D':'')+(op.isViewAll?'v':'')+(op.isModifyAll?'m':'')
                );
            }
        });

        // Return data
        return workingMatrix.toDataMatrix();
    }
}

class RecipeObjects extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {SimpleLoggerIntf} logger
     * @returns {Array<string | DatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [ DatasetAliases.OBJECTTYPES, DatasetAliases.OBJECTS ];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} logger
     * @param {string} namespace Name of the package (if all use '*')
     * @param {string} type Type of the object to list (optional), '*' for any
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger, namespace, type) {

        // Get data
        const /** @type {Map<string, SFDC_ObjectType>} */ types = data.get(DatasetAliases.OBJECTTYPES);
        const /** @type {Map<string, SFDC_Object>} */ objects = data.get(DatasetAliases.OBJECTS);

        // Checking data
        if (!types) throw new Error(`RecipeObjects: Data from dataset alias 'OBJECTTYPES' was undefined.`);
        if (!objects) throw new Error(`RecipeObjects: Data from dataset alias 'OBJECTS' was undefined.`);

        // Augment and Filter data
        const array = [];
        await Processor.forEach(objects, (object) => {
            // Augment data
            object.typeRef = types.get(object.typeId);
            // Filter data
            if ((namespace === '*' || object.package === namespace) &&
                (type === '*' || object.typeRef?.id === type)) {
                array.push(object);
            }
        });

        // Return data
        return array.sort((a, b) => { return a.label < b.label ? -1 : 1; });
    }
}

class RecipeObjectTypes extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {SimpleLoggerIntf} logger
     * @returns {Array<string | DatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [ DatasetAliases.OBJECTTYPES ];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger) {

        // Get data
        const /** @type {Map<string, SFDC_ObjectType>} */ types = data.get(DatasetAliases.OBJECTTYPES);

        // Checking data
        if (!types) throw new Error(`RecipeObjectTypes: Data from dataset alias 'OBJECTTYPES' was undefined.`);

        // Return data
        return [... types.values()];
    }
}

class RecipeOrganization extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {SimpleLoggerIntf} logger
     * @returns {Array<string | DatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [DatasetAliases.ORGANIZATION];
    }

    /**
     * @description transform the data from the datasets and return the final result as an Array
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger) {

        // Get data
        const /** @type {Map<string, SFDC_Organization>} */ organization = data.get(DatasetAliases.ORGANIZATION);

        // Checking data
        if (!organization) throw new Error(`RecipeOrganization: Data from dataset alias 'ORGANIZATION' was undefined.`);

        // Return data
        return organization;
    }
}

class RecipePackages extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {SimpleLoggerIntf} logger
     * @returns {Array<string | DatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [ DatasetAliases.PACKAGES ];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger) {

        // Get data
        const /** @type {Map<string, SFDC_Package>} */ packages = data.get(DatasetAliases.PACKAGES);

        // Checking data
        if (!packages) throw new Error(`RecipePackages: Data from dataset alias 'PACKAGES' was undefined.`);

        // Return data
        return [... packages.values()];
    }
}

class RecipePermissionSets extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {SimpleLoggerIntf} logger
     * @returns {Array<string | DatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [
            DatasetAliases.PERMISSIONSETS
        ];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} logger
     * @param {string} namespace Name of the package (if all use '*')
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger, namespace) {

        // Get data
        const /** @type {Map<string, SFDC_PermissionSet>} */ permissionSets = data.get(DatasetAliases.PERMISSIONSETS);

        // Checking data
        if (!permissionSets) throw new Error(`RecipePermissionSets: Data from dataset alias 'PERMISSIONSETS' was undefined.`);

        // Augment and Filter data
        const array = [];
        await Processor.forEach(permissionSets, async (permissionSet) => {
            // Filter data
            if (namespace === '*' || permissionSet.package === namespace) {
                array.push(permissionSet);
            }
        });

        // Return data
        return array;
    }
}

class RecipeProcessBuilders extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {SimpleLoggerIntf} logger
     * @returns {Array<string | DatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [DatasetAliases.FLOWS];
    }

    /**
     * @description transform the data from the datasets and return the final result as an Array
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger) {

        // Get data
        const /** @type {Map<string, SFDC_Flow>} */ flows = data.get(DatasetAliases.FLOWS);

        // Checking data
        if (!flows) throw new Error(`RecipeProcessBuilders: Data from dataset alias 'FLOWS' was undefined.`);

        // Filter data
        const array = [];
        await Processor.forEach(flows, (flow) => {
            if (flow.type === 'Workflow') {
                array.push(flow);
            }
        });

        // Return data
        return array;
    }
}

class RecipeProfilePasswordPolicies extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {SimpleLoggerIntf} logger
     * @returns {Array<string | DatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [ DatasetAliases.PROFILEPWDPOLICIES ];
    }

    /**
     * @description transform the data from the datasets and return the final result as an Array
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger) {

        // Get data
        const /** @type {Map<string, SFDC_ProfilePasswordPolicy>} */ policies = data.get(DatasetAliases.PROFILEPWDPOLICIES);

        // Checking data
        if (!policies) throw new Error(`RecipeProfilePasswordPolicies: Data from dataset alias 'PROFILEPWDPOLICIES' was undefined.`);

        // Return all data
        return [... policies.values()];
    }
}

class RecipeProfileRestrictions extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {SimpleLoggerIntf} logger
     * @returns {Array<string | DatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [
            DatasetAliases.PROFILES,
            DatasetAliases.PROFILERESTRICTIONS
        ];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} logger
     * @param {string} namespace Name of the package (if all use '*')
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger, namespace) {

        // Get data
        const /** @type {Map<string, SFDC_Profile>} */ profiles = data.get(DatasetAliases.PROFILES);
        const /** @type {Map<string, SFDC_ProfileRestrictions>} */ profileRestrictions = data.get(DatasetAliases.PROFILERESTRICTIONS);

        // Checking data
        if (!profiles) throw new Error(`RecipeProfileRestrictions: Data from dataset alias 'PROFILES' was undefined.`);
        if (!profileRestrictions) throw new Error(`RecipeProfileRestrictions: Data from dataset alias 'PROFILERESTRICTIONS' was undefined.`);

        // Augment and Filter data
        const array = [];
        await Processor.forEach(profileRestrictions, (restriction) => {
            // Augment data
            restriction.profileRef = profiles.get(restriction.profileId);
            // Filter data
            if (namespace === '*' || restriction.profileRef?.package === namespace) {
                array.push(restriction);
            }
        });

        // Return data
        return array;
    }
}

class RecipeProfiles extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {SimpleLoggerIntf} logger
     * @returns {Array<string | DatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [DatasetAliases.PROFILES];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} logger
     * @param {string} namespace Name of the package (if all use '*')
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger, namespace) {

        // Get data
        const /** @type {Map<string, SFDC_Profile>} */ profiles = data.get(DatasetAliases.PROFILES);

        // Checking data
        if (!profiles) throw new Error(`RecipeProfiles: Data from dataset alias 'PROFILES' was undefined.`);

        // Filter data
        const array = [];
        await Processor.forEach(profiles, (profile) => {
            if (namespace === '*' || profile.package === namespace) {
                array.push(profile);
            }
        });

        // Return data
        return array;
    }
}

class RecipePublicGroups extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {SimpleLoggerIntf} logger
     * @returns {Array<string | DatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [DatasetAliases.USERS, DatasetAliases.GROUPS];
    }

    /**
     * @description transform the data from the datasets and return the final result as an Array
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger) {

        // Get data
        const /** @type {Map<string, SFDC_Group>} */ groups = data.get(DatasetAliases.GROUPS);
        const /** @type {Map<string, SFDC_User>} */ users = data.get(DatasetAliases.USERS);

        // Checking data
        if (!groups) throw new Error(`RecipePublicGroups: Data from dataset alias 'GROUPS' was undefined.`);
        if (!users) throw new Error(`RecipePublicGroups: Data from dataset alias 'USERS' was undefined.`);

        // Augment and filter data
        const array = [];
        await Processor.forEach(groups, async (group) => {
            // Augment data
            group.directUserRefs = await Processor.map(
                group.directUserIds,
                (id) => users.get(id),
                (id) => users.has(id)
            );
            group.directGroupRefs = await Processor.map(
                group.directGroupIds,
                (id) => groups.get(id),
                (id) => groups.has(id)
            );
            // Filter data
            if (group.isPublicGroup === true) {
                array.push(group);
            }
        });

        // Return data
        return array;
    }
}

class RecipeQueues extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {SimpleLoggerIntf} logger
     * @returns {Array<string | DatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [DatasetAliases.USERS, DatasetAliases.GROUPS];
    }

    /**
     * @description transform the data from the datasets and return the final result as an Array
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger) {

        // Get data
        const /** @type {Map<string, SFDC_Group>} */ groups = data.get(DatasetAliases.GROUPS);
        const /** @type {Map<string, SFDC_User>} */ users = data.get(DatasetAliases.USERS);

        // Checking data
        if (!groups) throw new Error(`RecipeQueues: Data from dataset alias 'GROUPS' was undefined.`);
        if (!users) throw new Error(`RecipeQueues: Data from dataset alias 'USERS' was undefined.`);

        // Augment and filter data
        const array = [];
        await Processor.forEach(groups, async (group) => {
            // Augment data
            group.directUserRefs = await Processor.map(
                group.directUserIds,
                (id) => users.get(id),
                (id) => users.has(id)
            );
            group.directGroupRefs = await Processor.map(
                group.directGroupIds,
                (id) => groups.get(id),
                (id) => groups.has(id)
            );
            // Filter data
            if (group.isQueue === true) {
                array.push(group);
            }
        });

        // Return data
        return array;
    }
}

class RecipeUserRoles extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {SimpleLoggerIntf} logger
     * @returns {Array<string | DatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [
            DatasetAliases.USERROLES,
            DatasetAliases.USERS
        ];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger) {

        // Get data
        const /** @type {Map<string, SFDC_UserRole>} */ userRoles = data.get(DatasetAliases.USERROLES);
        const /** @type {Map<string, SFDC_User>} */ users = data.get(DatasetAliases.USERS);

        // Checking data
        if (!userRoles) throw new Error(`RecipeUserRoles: Data from dataset alias 'USERROLES' was undefined.`);
        if (!users) throw new Error(`RecipeUserRoles: Data from dataset alias 'USERS' was undefined.`);

        // Augment data
        await Processor.forEach(userRoles, async (userRole) => {
            // Augment data
            if (userRole.hasActiveMembers === true) {
                userRole.activeMemberRefs = await Processor.map(userRole.activeMemberIds, (id) => users.get(id));
            }
            if (userRole.hasParent === true) {
                userRole.parentRef = userRoles.get(userRole.parentId);
            }
        });

        // Return data
        return [... userRoles.values()];
    }
}

class RecipeVisualForceComponents extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {SimpleLoggerIntf} logger
     * @returns {Array<string | DatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [DatasetAliases.VISUALFORCECOMPONENTS];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} logger
     * @param {string} namespace Name of the package (if all use '*')
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger, namespace) {

        // Get data
        const /** @type {Map<string, SFDC_VisualForceComponent>} */ components = data.get(DatasetAliases.VISUALFORCECOMPONENTS);

        // Checking data
        if (!components) throw new Error(`RecipeVisualForceComponents: Data from dataset alias 'VISUALFORCECOMPONENTS' was undefined.`);

        // Filter data
        const array = [];
        await Processor.forEach(components, (component) => {
            if (namespace === '*' || component.package === namespace) {
                array.push(component);
            }
        });

        // Return data
        return array;
    }
}

class RecipeVisualForcePages extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {SimpleLoggerIntf} logger
     * @returns {Array<string | DatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [DatasetAliases.VISUALFORCEPAGES];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} logger
     * @param {string} namespace Name of the package (if all use '*')
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger, namespace) {

        // Get data
        const /** @type {Map<string, SFDC_VisualForcePage>} */ pages = data.get(DatasetAliases.VISUALFORCEPAGES);

        // Checking data
        if (!pages) throw new Error(`RecipeVisualForcePages: Data from dataset alias 'VISUALFORCEPAGES' was undefined.`);

        // Filter data
        const array = [];
        await Processor.forEach(pages, (page) => {
            if (namespace === '*' || page.package === namespace) {
                array.push(page);
            }
        });

        // Return data
        return array;
    }
}

class RecipeWorkflows extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {SimpleLoggerIntf} logger
     * @returns {Array<string | DatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [DatasetAliases.WORKFLOWS];
    }

    /**
     * @description transform the data from the datasets and return the final result as an Array
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger) {

        // Get data
        const /** @type {Map<string, SFDC_Workflow>} */ workflows = data.get(DatasetAliases.WORKFLOWS);

        // Checking data
        if (!workflows) throw new Error(`RecipeWorkflows: Data from dataset alias 'WORKFLOWS' was undefined.`);

        // Return data
        return [... workflows.values()];
    }
}

class RecipeApexTests extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {SimpleLoggerIntf} logger
     * @returns {Array<string | DatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [
            DatasetAliases.APEXCLASSES
        ];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} logger
     * @param {string} namespace Name of the package (if all use '*')
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger, namespace) {

        // Get data
        const /** @type {Map<string, SFDC_ApexClass>} */ apexClasses = data.get(DatasetAliases.APEXCLASSES);

        // Checking data
        if (!apexClasses) throw new Error(`RecipeApexTests: Data from dataset alias 'APEXCLASSES' was undefined.`);

        // Augment and filter data
        const array = [];
        await Processor.forEach(apexClasses, async (apexClass) => {            
            // Augment data
            const results = await Promise.all([
                Processor.map(apexClass.relatedTestClassIds, id => apexClasses.get(id)),
                Processor.map(apexClass.relatedClassIds, id => apexClasses.get(id))
            ]);
            apexClass.relatedTestClassRefs = results[0];
            apexClass.relatedClassRefs = results[1];
            // Filter data
            if ((namespace === '*' || apexClass.package === namespace) && 
                apexClass.isTest === true && 
                apexClass.needsRecompilation === false) {
                array.push(apexClass);
            }
        });

        // Return data
        return array;
    }
}

class RecipeApexUncompiled extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {SimpleLoggerIntf} logger
     * @returns {Array<string | DatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [
            DatasetAliases.APEXCLASSES
        ];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} logger
     * @param {string} namespace Name of the package (if all use '*')
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger, namespace) {

        // Get data
        const /** @type {Map<string, SFDC_ApexClass>} */ apexClasses = data.get(DatasetAliases.APEXCLASSES);

        // Checking data
        if (!apexClasses) throw new Error(`RecipeApexUncompiled: Data from dataset alias 'APEXCLASSES' was undefined.`);

        // Augment and filter data
        const array = [];
        await Processor.forEach(apexClasses, async (apexClass) => {            
            // Augment data
            const results = await Promise.all([
                Processor.map(apexClass.relatedTestClassIds, id => apexClasses.get(id)),
                Processor.map(apexClass.relatedClassIds, id => apexClasses.get(id))
            ]);
            apexClass.relatedTestClassRefs = results[0];
            apexClass.relatedClassRefs = results[1];
            // Filter data
            if ((namespace === '*' || apexClass.package === namespace) && apexClass.needsRecompilation === true) {
                array.push(apexClass);
            }
        });

        // Return data
        return array;
    }
}

class RecipeFieldPermissions extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {SimpleLoggerIntf} logger
     * @param {string} object Name of the object to describe in this recipe's instance.
     * @returns {Array<string | DatasetRunInformation>}
     * @public
     */
    extract(logger, object) {
        const datasetRunInfoFieldPerms = new DatasetRunInformation(DatasetAliases.FIELDPERMISSIONS, `${DatasetAliases.FIELDPERMISSIONS}_${object}`);
        datasetRunInfoFieldPerms.parameters.set('object', object);
        return [
            datasetRunInfoFieldPerms,
            DatasetAliases.PROFILES,
            DatasetAliases.PERMISSIONSETS
        ];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} logger
     * @param {string} object Name of the object to describe in this recipe's instance.
     * @param {string} namespace Name of the package (if all use '*')
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger, object, namespace) {

        // Get data
        const /** @type {Map<string, SFDC_FieldPermission>} */ fieldPermissions = data.get(DatasetAliases.FIELDPERMISSIONS);
        const /** @type {Map<string, SFDC_Profile>} */ profiles = data.get(DatasetAliases.PROFILES);
        const /** @type {Map<string, SFDC_PermissionSet>} */ permissionSets = data.get(DatasetAliases.PERMISSIONSETS);

        // Checking data
        if (!fieldPermissions) throw new Error(`RecipeFieldPermissions: Data from dataset alias 'FIELDPERMISSIONS' was undefined.`);
        if (!profiles) throw new Error(`RecipeFieldPermissions: Data from dataset alias 'PROFILES' was undefined.`);
        if (!permissionSets) throw new Error(`RecipeFieldPermissions: Data from dataset alias 'PERMISSIONSETS' was undefined.`);

        // Augment and filter data
        const workingMatrix = DataMatrixFactory.create();

        await Processor.forEach(fieldPermissions, (/** @type {SFDC_FieldPermission} */ fp) => {
            // Augment data
            if (fp.parentId.startsWith('0PS') === true) {
                fp.parentRef = permissionSets.get(fp.parentId);
            } else {
                fp.parentRef = profiles.get(fp.parentId);
            }
            // Filter data
            if (namespace === '*' || fp.parentRef.package === namespace ) {
                if (workingMatrix.hasRowHeader(fp.parentId) === false) {
                    workingMatrix.setRowHeader(fp.parentId, fp.parentRef);
                }
                // Column header: key and value are same so not needed!
                /* if (workingMatrix.hasColumnHeader(fp.fieldApiName) === false) {
                    workingMatrix.setColumnHeader(fp.fieldApiName, fp.fieldApiName);
                }*/
                workingMatrix.addValueToProperty(
                    fp.parentId,
                    fp.fieldApiName,
                    (fp.isRead?'R':'') + (fp.isEdit?'U':'')
                );
            }
        });

        // Return data
        return workingMatrix.toDataMatrix();
    }
}

class RecipeValidationRules extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {SimpleLoggerIntf} logger
     * @returns {Array<string | DatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [
            DatasetAliases.VALIDATIONRULES,
            DatasetAliases.OBJECTTYPES, 
            DatasetAliases.OBJECTS
        ];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} logger
     * @param {string} namespace Name of the package (if all use '*')
     * @param {string} objecttype Name of the type (if all use '*')
     * @param {string} object API name of the object (if all use '*')
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger, namespace, objecttype, object) {

        // Get data
        const /** @type {Map<string, SFDC_ObjectType>} */ types = data.get(DatasetAliases.OBJECTTYPES);
        const /** @type {Map<string, SFDC_Object>} */ objects = data.get(DatasetAliases.OBJECTS);
        const /** @type {Map<string, SFDC_ValidationRule>} */ validationRules = data.get(DatasetAliases.VALIDATIONRULES);

        // Checking data
        if (!types) throw new Error(`RecipeValidationRules: Data from dataset alias 'OBJECTTYPES' was undefined.`);
        if (!objects) throw new Error(`RecipeValidationRules: Data from dataset alias 'OBJECTS' was undefined.`);
        if (!validationRules) throw new Error(`RecipeValidationRules: Data from dataset alias 'VALIDATIONRULES' was undefined.`);

        // Augment and filter data
        const array = [];
        await Processor.forEach(validationRules, (/** @type {SFDC_ValidationRule} */ validationRule) => {
            // Augment
            const objectRef = objects.get(validationRule.objectId);
            if (objectRef && !objectRef.typeRef) {
                objectRef.typeRef = types.get(objectRef.typeId);
            }
            validationRule.objectRef = objectRef;
            // Filter
            if ((namespace === '*' || validationRule.package === namespace) &&
                (objecttype === '*' || validationRule.objectRef?.typeRef?.id === objecttype) &&
                (object === '*' || validationRule.objectRef?.apiname === object)) {
                array.push(validationRule);
            }
        });

        // Return data
        return array;
    }
}

class RecipePermissionSetLicenses extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {SimpleLoggerIntf} logger
     * @returns {Array<string | DatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [
            DatasetAliases.PERMISSIONSETLICENSES,
            DatasetAliases.PERMISSIONSETS
        ];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger) {

        // Get data
        const /** @type {Map<string, SFDC_PermissionSetLicense>} */ permissionSetLicenses = data.get(DatasetAliases.PERMISSIONSETLICENSES);
        const /** @type {Map<string, SFDC_PermissionSet>} */ permissionSets = data.get(DatasetAliases.PERMISSIONSETS);

        // Checking data
        if (!permissionSetLicenses) throw new Error(`RecipePermissionSetLicenses: Data from dataset alias 'PERMISSIONSETLICENSES' was undefined.`);
        if (!permissionSets) throw new Error(`RecipePermissionSetLicenses: Data from dataset alias 'PERMISSIONSETS' was undefined.`);

        // Augment data
        await Processor.forEach(permissionSetLicenses, async (permissionSetLicense) => {
            permissionSetLicense.permissionSetRefs = await Processor.map(
                permissionSetLicense.permissionSetIds,
                (/** @type {string} */ id) => permissionSets.get(id),
                (/** @type {string} */ id) => permissionSets.has(id)
            );
        });

        // Return data
        return [... permissionSetLicenses.values()];
    }
}

class RecipePageLayouts extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {SimpleLoggerIntf} logger
     * @returns {Array<string | DatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [
            DatasetAliases.PAGELAYOUTS,
            DatasetAliases.OBJECTTYPES, 
            DatasetAliases.OBJECTS
        ];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} logger
     * @param {string} namespace Name of the package (if all use '*')
     * @param {string} objecttype Name of the type (if all use '*')
     * @param {string} object API name of the object (if all use '*')
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger, namespace, objecttype, object) {

        // Get data
        const /** @type {Map<string, SFDC_PageLayout>} */ pageLayouts = data.get(DatasetAliases.PAGELAYOUTS);
        const /** @type {Map<string, SFDC_ObjectType>} */ types = data.get(DatasetAliases.OBJECTTYPES);
        const /** @type {Map<string, SFDC_Object>} */ objects = data.get(DatasetAliases.OBJECTS);

        // Checking data
        if (!types) throw new Error(`RecipePageLayouts: Data from dataset alias 'OBJECTTYPES' was undefined.`);
        if (!objects) throw new Error(`RecipePageLayouts: Data from dataset alias 'OBJECTS' was undefined.`);
        if (!pageLayouts) throw new Error(`RecipePageLayouts: Data from dataset alias 'PAGELAYOUTS' was undefined.`);

        // Augment and filter data
        const array = [];
        await Processor.forEach(pageLayouts, (pageLayout) => {
            // Augment data
            const objectRef = objects.get(pageLayout.objectId);
            if (objectRef && !objectRef.typeRef) {
                objectRef.typeRef = types.get(objectRef.typeId);
            }
            pageLayout.objectRef = objectRef;
            // Filter data
            if ((namespace === '*' || pageLayout.package === namespace) &&
                (objecttype === '*' || pageLayout.objectRef?.typeRef?.id === objecttype) &&
                (object === '*' || pageLayout.objectRef?.apiname === object)) {
                array.push(pageLayout);
            }
        });

        // Return data
        return array;
    }
}

/**
 * @description Recipe Manager
 */ 
class RecipeManager extends RecipeManagerIntf {

    /**
     * @description Private logger to use
     * @type {LoggerIntf}
     * @private
     */
    _logger;

    /**
     * @description Map of recipes given their alias.
     * @type {Map<string, Recipe>}
     * @private
     */
    _recipes;

    /**
     * @description Recipes need a dataset manager to work
     * @type {DatasetManagerIntf}
     * @private
     */
    _datasetManager;
            
    /**
     * @description Recipe Manager constructor
     * @param {DatasetManagerIntf} datasetManager 
     * @param {LoggerIntf} logger
     */
    constructor(datasetManager, logger) {
        super();

        if (datasetManager instanceof DatasetManagerIntf === false) {
            throw new TypeError('The given datasetManager is not an instance of DatasetManagerIntf.');
        }
        if (logger instanceof LoggerIntf === false) {
            throw new TypeError('The given logger is not an instance of LoggerIntf.');
        }

        this._datasetManager = datasetManager;
        this._logger = logger;
        this._recipes = new Map();

        this._recipes.set(RecipeAliases.ACTIVE_USERS, new RecipeActiveUsers());
        this._recipes.set(RecipeAliases.APEX_CLASSES, new RecipeApexClasses());
        this._recipes.set(RecipeAliases.APEX_TESTS, new RecipeApexTests());
        this._recipes.set(RecipeAliases.APEX_TRIGGERS, new RecipeApexTriggers());
        this._recipes.set(RecipeAliases.APEX_UNCOMPILED, new RecipeApexUncompiled());
        this._recipes.set(RecipeAliases.APP_PERMISSIONS, new RecipeAppPermissions());
        this._recipes.set(RecipeAliases.CURRENT_USER_PERMISSIONS, new RecipeCurrentUserPermissions());
        this._recipes.set(RecipeAliases.CUSTOM_FIELDS, new RecipeCustomFields());
        this._recipes.set(RecipeAliases.CUSTOM_LABELS, new RecipeCustomLabels());
        this._recipes.set(RecipeAliases.FIELD_PERMISSIONS, new RecipeFieldPermissions());
        this._recipes.set(RecipeAliases.FLOWS, new  RecipeFlows());
        this._recipes.set(RecipeAliases.LIGHTNING_AURA_COMPONENTS, new RecipeLightningAuraComponents());
        this._recipes.set(RecipeAliases.LIGHTNING_PAGES, new RecipeLightningPages());
        this._recipes.set(RecipeAliases.LIGHTNING_WEB_COMPONENTS, new RecipeLightningWebComponents());
        this._recipes.set(RecipeAliases.OBJECT, new RecipeObject());
        this._recipes.set(RecipeAliases.OBJECT_PERMISSIONS, new RecipeObjectPermissions());
        this._recipes.set(RecipeAliases.OBJECTS, new RecipeObjects());
        this._recipes.set(RecipeAliases.OBJECT_TYPES, new RecipeObjectTypes());
        this._recipes.set(RecipeAliases.ORGANIZATION, new RecipeOrganization());
        this._recipes.set(RecipeAliases.PACKAGES, new RecipePackages());
        this._recipes.set(RecipeAliases.PAGE_LAYOUTS, new RecipePageLayouts());
        this._recipes.set(RecipeAliases.PERMISSION_SETS, new RecipePermissionSets());
        this._recipes.set(RecipeAliases.PERMISSION_SET_LICENSES, new RecipePermissionSetLicenses());
        this._recipes.set(RecipeAliases.PROCESS_BUILDERS, new RecipeProcessBuilders());
        this._recipes.set(RecipeAliases.PROFILE_PWD_POLICIES, new RecipeProfilePasswordPolicies());
        this._recipes.set(RecipeAliases.PROFILE_RESTRICTIONS, new RecipeProfileRestrictions());
        this._recipes.set(RecipeAliases.PROFILES, new RecipeProfiles());
        this._recipes.set(RecipeAliases.PUBLIC_GROUPS, new RecipePublicGroups());
        this._recipes.set(RecipeAliases.QUEUES, new RecipeQueues());
        this._recipes.set(RecipeAliases.USER_ROLES, new RecipeUserRoles());
        this._recipes.set(RecipeAliases.VALIDATION_RULES, new RecipeValidationRules());
        this._recipes.set(RecipeAliases.VISUALFORCE_COMPONENTS, new RecipeVisualForceComponents());
        this._recipes.set(RecipeAliases.VISUALFORCE_PAGES, new RecipeVisualForcePages());
        this._recipes.set(RecipeAliases.WORKFLOWS, new RecipeWorkflows());
    }

    /**
     * @description Runs a designated recipe (by its alias)
     *   - Step 1. Extract the list of datasets to run that this recipe uses
     *   - Step 2. Run the given datasets and gather the global data retrieved
     *   - Step 3. Transform the retrieved data and return the final result as a Map
     * @param {string} alias String representation of a recipe -- use one of the RECIPE_*_ALIAS constants available in this unit.
     * @param {Array<string|object>} parameters List of values to pass to the exract and tranform methods of the recipe.
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map>} Returns as it is the value returned by the transform method recipe.
     * @async
     * @public
     */
    async run(alias, ...parameters) {
        // Check if alias is registered
        if (this._recipes.has(alias) === false) {
            throw new TypeError(`The given alias (${alias}) does not correspond to a registered recipe.`);
        } 
        const section = `RECIPE ${alias}`;
        
        /**
         * @description The recipe designated by the alias
         * @type {Recipe}
         */
        const recipe = this._recipes.get(alias);

        // -------------------
        // Extract
        // -------------------
        this._logger.log(section, 'How many datasets this recipe has?');

        /**
         * @description The list of datasets to be used by this recipe
         * @type {Array<string | DatasetRunInformation>}}
         */
        let datasets;
        try {
            datasets = recipe.extract(
                // local logger
                this._logger.toSimpleLogger(section),
                // all parameters
                ...parameters
            );
        } catch(error) {
            this._logger.failed(section, error);
            throw error;
        }
        this._logger.log(section, `This recipe has ${datasets?.length} ${datasets?.length>1?'datasets':'dataset'}: ${datasets.map((d) => d instanceof DatasetRunInformation ? d.alias : d ).join(', ')}...`);
        let data;
        try {
            data = await this._datasetManager.run(datasets);
        } catch(error) {
            this._logger.failed(section, error);
            throw error;
        }
        this._logger.log(section, 'Datasets information successfuly retrieved!');

        // -------------------
        // Transform
        // -------------------
        this._logger.log(section, 'This recipe will now transform all this information...');

        /**
         * @description The final data that we will return as it is.
         * @type {Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map}
         */
        let finalData;
        try {
            finalData = await recipe.transform(
                // Data from datasets
                data, 
                // local logger
                this._logger.toSimpleLogger(section),
                // all parameters
                ...parameters);
        } catch(error) {
            this._logger.failed(section, error);
            throw error;
        }
        this._logger.ended(section, 'Transformation successfuly done!');

        // Return value
        return finalData;
    }

    /**
     * @description Cleans a designated recipe (by its alias) and the corresponding datasets.
     *    - Step 1. Extract the list of datasets to clean that this recipe uses
     *    - Step 2. Clean the given datasets
     * @param {string} alias String representation of a recipe -- use one of the RECIPE_*_ALIAS constants available in this unit.
     * @param {Array<string|object>} [parameters] List of values to pass to the exract method of the recipe.
     * @public
     */
    clean(alias, ...parameters) {
        // Check if alias is registered
        if (this._recipes.has(alias) === false) {
            throw new TypeError(`The given alias (${alias}) does not correspond to a registered recipe.`);
        } 
        const section = `RECIPE ${alias}`;
        const recipe = this._recipes.get(alias);

        // -------------------
        // Extract
        // -------------------
        this._logger.log(section, 'How many datasets this recipe has?');
        let datasets;
        try {
            datasets = recipe.extract(
                // local logger
                this._logger.toSimpleLogger(section),
                // all parameters
                ...parameters
            );
        } catch(error) {
            this._logger.failed(section, error);
            throw error;
        }
        this._logger.log(section, `This recipe has ${datasets?.length} ${datasets?.length>1?'datasets':'dataset'}: ${datasets.map((d) => d instanceof DatasetRunInformation ? d.alias : d ).join(', ')}...`);

        // -------------------
        // Clean
        // -------------------
        this._logger.log(section, 'Clean all datasets...');
        try {
            this._datasetManager.clean(datasets);
        } catch(error) {
            this._logger.failed(section, error);
            throw error;
        }
        this._logger.ended(section, 'Datasets succesfully cleaned!');
    }
}

/**
 * @description Maximum number of Ids that is contained per DAPI query
 * @private
 */
const MAX_IDS_IN_DAPI_REQUEST_SIZE = 100;

/**
 * @description When an SObject does not support QueryMore we use an alternative that will gather a maximum number of records
 *                  Where the salesforce maximum is 2000 for EntityDefinition
 * @private
 */
const MAX_NOQUERYMORE_BATCH_SIZE = 2000;

/**
 * @description Maximum batch size when calling the Query api (saleforce can choose to use less). This is only up to the 
 *                  server to decide how many records it returns
 * @private
 */
const MAX_STANDARDSOQL_BATCH_SIZE = 2000;

/**
 * @description Maximum number of members we want per type/request 
 * @private
 */
const MAX_MEMBERS_IN_METADATAAPI_REQUEST_SIZE = 10;

/**
 * @description Maximum number of sub queries we want to have in a single composite request
 *              Where the salesforce maximum is 25 BUT ony 5 can be query or sobject operations
 * @private
 * @see https://developer.salesforce.com/docs/atlas.en-us.232.0.api_rest.meta/api_rest/resources_composite_composite.htm
 */
const MAX_COMPOSITE_REQUEST_SIZE = 5;

/** 
 * @description Salesforce APIs Manager Implementation with JsForce Connection
 * @public
 */
class SalesforceManager extends SalesforceManagerIntf {

    /**
     * @description API Version used to make the connection
     * @type {number}
     * @private
     */
    _apiVersion;

    /**
     * @description WatchDog to monitor the API Usage
     * @type {SalesforceWatchDog}
     * @private
     */ 
    _watchDog;

    /**
     * @description JsForce Connection
     * @type {any}
     * @private
     */ 
    _connection;

    /**
     * @description Construct the connection manager from a ConnectionFactory (like JSForce) and a VFP accesstoken
     * @param {any} jsConnectionFactory 
     * @param {string} accessToken 
     * @public
     */
    constructor(jsConnectionFactory, accessToken) {

        super();
        
        this._apiVersion = SecretSauce.CurrentApiVersion;
        
        // Create a JsForce Connection to the current salesforce org
        const jsConnection = new jsConnectionFactory.Connection({
            accessToken: accessToken,
            version: this._apiVersion + '.0',
            maxRequest: 15 // making sure we set it to a reasonable value = 15
        });

        // Create the WatchDog instance which knows how to retrieve the API Usage from the connection
        this._watchDog = new SalesforceWatchDog(
            () => {
                return { 
                    used: jsConnection.limitInfo?.apiUsage?.used, 
                    max: jsConnection.limitInfo?.apiUsage?.limit
                };
            }
        );

        // Link the connection to the manager
        this._connection = jsConnection;
    }

    /**
     * @see SalesforceManagerIntf.apiVersion
     * @returns {number}
     * @public
     */
    get apiVersion() {
        return this._apiVersion;
    }

    /**
     * @see SalesforceManagerIntf.caseSafeId
     * @param {string} id 
     * @returns {string}
     * @public
     */
    caseSafeId(id) {
        if (id && id.length === 18) return id.substr(0, 15);
        return id;
    }

    /**
     * @see SalesforceManagerIntf.setupUrl
     * @param {string} id Identification of the data to be used in the Setup URL. 
     * @param {string} type Type of the data to be used to choose the correct URL template
     * @param {string} [parentId] In case the template URL has a reference to the parent, this optional property will contain the parent identification.
     * @param {string} [parentType] In case the template URL has a reference to the parent, this optional property will contain the parent type.
     * @returns {string} 
     * @public
     */
    setupUrl(id, type, parentId, parentType) {
        // If the salesforce identifier is not set, just return a blank url!
        if (!id) {
            return '';
        }
        switch (type) {
            // FIELD
            case SalesforceMetadataTypes.STANDARD_FIELD:
            case SalesforceMetadataTypes.CUSTOM_FIELD:
            case SalesforceMetadataTypes.ANY_FIELD: {
                switch (parentType) {
                    case SalesforceMetadataTypes.STANDARD_OBJECT:
                    case SalesforceMetadataTypes.CUSTOM_OBJECT:
                    case SalesforceMetadataTypes.KNOWLEDGE_ARTICLE:    return `/lightning/setup/ObjectManager/` + (parentId ? `${parentId}/FieldsAndRelationships/${id}/view` : `page?address=%2F${id}`);
                    case SalesforceMetadataTypes.CUSTOM_BIG_OBJECT:    return `/lightning/setup/BigObjects/page?address=%2F${id}%3Fsetupid%3DBigObjects`;
                    case SalesforceMetadataTypes.CUSTOM_EVENT:         return `/lightning/setup/EventObjects/page?address=%2F${id}%3Fsetupid%3DEventObjects`;
                    case SalesforceMetadataTypes.CUSTOM_SETTING:       return `/lightning/setup/CustomSettings/page?address=%2F${id}%3Fsetupid%3DCustomSettings`;
                    case SalesforceMetadataTypes.CUSTOM_METADATA_TYPE: return `/lightning/setup/CustomMetadata/page?address=%2F${id}%3Fsetupid%3DCustomMetadata`;
                    case SalesforceMetadataTypes.EXTERNAL_OBJECT:      return `/lightning/setup/ExternalObjects/page?address=%2F${id}%3Fsetupid%3DExternalObjects`;
                    default:                                                   return `/lightning/setup/ObjectManager/page?address=%2F${id}`;
                }
            }
            // SOBJECT
            case SalesforceMetadataTypes.STANDARD_OBJECT:
            case SalesforceMetadataTypes.CUSTOM_OBJECT:
            case SalesforceMetadataTypes.KNOWLEDGE_ARTICLE:       return `/lightning/setup/ObjectManager/${id}/Details/view`;
            case SalesforceMetadataTypes.CUSTOM_BIG_OBJECT:       return `/lightning/setup/BigObjects/page?address=%2F${id}%3Fsetupid%3DBigObjects`;
            case SalesforceMetadataTypes.CUSTOM_EVENT:            return `/lightning/setup/EventObjects/page?address=%2F${id}%3Fsetupid%3DEventObjects`;
            case SalesforceMetadataTypes.CUSTOM_SETTING:          return `/lightning/setup/CustomSettings/page?address=%2F${id}%3Fsetupid%3DCustomSettings`;
            case SalesforceMetadataTypes.CUSTOM_METADATA_TYPE:    return `/lightning/setup/CustomMetadata/page?address=%2F${id}%3Fsetupid%3DCustomMetadata`;
            case SalesforceMetadataTypes.EXTERNAL_OBJECT:         return `/lightning/setup/ExternalObjects/page?address=%2F${id}%3Fsetupid%3DExternalObjects`;
            // SOBJECT COMPONENTS
            case SalesforceMetadataTypes.PAGE_LAYOUT:             return `/lightning/setup/ObjectManager/` + (parentId ? `${parentId}/PageLayouts/${id}/view` : `page?address=%2F${id}`);
            case SalesforceMetadataTypes.VALIDATION_RULE:         return `/lightning/setup/ObjectManager/page?address=%2F${id}`;
            case SalesforceMetadataTypes.WEB_LINK:                return `/lightning/setup/ObjectManager/` + (parentId ? `${parentId}/ButtonsLinksActions/${id}/view` : `page?address=%2F${id}`);
            case SalesforceMetadataTypes.RECORD_TYPE:             return `/lightning/setup/ObjectManager/` + (parentId ? `${parentId}/RecordTypes/${id}/view` : `page?address=%2F${id}`);
            case SalesforceMetadataTypes.APEX_TRIGGER:            return `/lightning/setup/ObjectManager/` + (parentId ? `${parentId}/ApexTriggers/${id}/view` : `page?address=%2F${id}`);
            case SalesforceMetadataTypes.FIELD_SET:               return `/lightning/setup/ObjectManager/` + (parentId ? `${parentId}/FieldSets/${id}/view` : `page?address=%2F${id}`);
            // SECURITY AND ACCESS
            case SalesforceMetadataTypes.USER:                    return `/lightning/setup/ManageUsers/page?address=%2F${id}%3Fnoredirect%3D1%26isUserEntityOverride%3D1`;
            case SalesforceMetadataTypes.PROFILE:                 return `/lightning/setup/EnhancedProfiles/page?address=%2F${id}`;
            case SalesforceMetadataTypes.PERMISSION_SET:          return `/lightning/setup/PermSets/page?address=%2F${id}`;
            case SalesforceMetadataTypes.PERMISSION_SET_LICENSE:  return `/lightning/setup/PermissionSetLicense/page?address=%2F${id}`;
            case SalesforceMetadataTypes.PERMISSION_SET_GROUP:    return `/lightning/setup/PermSetGroups/page?address=%2F${id}`;
            case SalesforceMetadataTypes.ROLE:                    return `/lightning/setup/Roles/page?address=%2F${id}`;
            case SalesforceMetadataTypes.PUBLIC_GROUP:            return `/lightning/setup/PublicGroups/page?address=%2Fsetup%2Fown%2Fgroupdetail.jsp%3Fid%3D${id}`;
            case SalesforceMetadataTypes.QUEUE:                   return `/lightning/setup/Queues/page?address=%2Fp%2Fown%2FQueue%2Fd%3Fid%3D${id}`;
            case SalesforceMetadataTypes.TECHNICAL_GROUP:         return '';
            // SETTING
            case SalesforceMetadataTypes.CUSTOM_LABEL:            return `/lightning/setup/ExternalStrings/page?address=%2F${id}`;
            case SalesforceMetadataTypes.STATIC_RESOURCE:         return `/lightning/setup/StaticResources/page?address=%2F${id}`;
            case SalesforceMetadataTypes.CUSTOM_SITE:             return `/servlet/networks/switch?networkId=${id}&startURL=%2FcommunitySetup%2FcwApp.app%23%2Fc%2Fhome&`;
            case SalesforceMetadataTypes.CUSTOM_TAB:              return `/lightning/setup/CustomTabs/page?address=%2F${id}`;
            // AUTOMATION
            case SalesforceMetadataTypes.FLOW_VERSION:            return `/builder_platform_interaction/flowBuilder.app?flowId=${id}`;
            case SalesforceMetadataTypes.FLOW_DEFINITION:         return `/${id}`;
            case SalesforceMetadataTypes.WORKFLOW_RULE:           return `/lightning/setup/WorkflowRules/page?address=%2F${id}&nodeId=WorkflowRules`;
            // VISUAL COMPONENTS
            case SalesforceMetadataTypes.VISUAL_FORCE_PAGE:       return `/lightning/setup/ApexPages/page?address=%2F${id}`;
            case SalesforceMetadataTypes.VISUAL_FORCE_COMPONENT:  return `/lightning/setup/ApexComponent/page?address=%2F${id}`;
            case SalesforceMetadataTypes.AURA_WEB_COMPONENT:
            case SalesforceMetadataTypes.LIGHTNING_WEB_COMPONENT: return `/lightning/setup/LightningComponentBundles/page?address=%2F${id}`;
            case SalesforceMetadataTypes.LIGHTNING_PAGE:          return `/lightning/setup/ObjectManager/` + (parentId ? `${parentId}/LightningPages/${id}/view` : `page?address=%2F${id}`);
            // APEX PROGAMMATION
            case SalesforceMetadataTypes.APEX_CLASS:              return `/lightning/setup/ApexClasses/page?address=%2F${id}`;
            // Other types or even undefined type
            default: {
                console.error(`Type <${type}> not supported yet. Returning "/id" as url. FYI, id was <${id}>, parentId was <${parentId}> and parentType was <${parentType}>`);
                return `/${id}`;
            }
        }
    }
    
    /**
     * @see SalesforceManagerIntf.getObjectType
     * @param {string} apiName 
     * @param {boolean} isCustomSetting 
     * @returns {string}
     * @public
     */
    getObjectType(apiName, isCustomSetting) {
        if (isCustomSetting === true) return OBJECTTYPE_ID_CUSTOM_SETTING;
        if (apiName.endsWith('__c')) return OBJECTTYPE_ID_CUSTOM_SOBJECT;
        if (apiName.endsWith('__x')) return OBJECTTYPE_ID_CUSTOM_EXTERNAL_SOBJECT;
        if (apiName.endsWith('__mdt')) return OBJECTTYPE_ID_CUSTOM_METADATA_TYPE;
        if (apiName.endsWith('__e')) return OBJECTTYPE_ID_CUSTOM_EVENT;
        if (apiName.endsWith('__ka')) return OBJECTTYPE_ID_KNOWLEDGE_ARTICLE;
        if (apiName.endsWith('__b')) return OBJECTTYPE_ID_CUSTOM_BIG_OBJECT;
        return OBJECTTYPE_ID_STANDARD_SOBJECT;
    }

    /**
     * @see SalesforceManagerIntf.dailyApiRequestLimitInformation
     * @returns {SalesforceUsageInformation} Information of the current usage of the Daily Request API
     * @public
     */
    get dailyApiRequestLimitInformation() {
        return this._watchDog.dailyApiRequestLimitInformation;
    }

    /**
     * @param {boolean} useTooling Use the tooling or not
     * @param {string} query SOQL query string
     * @param {Array<string>} byPasses List of error codes to by-pass
     * @param {Function} callback
     * @returns {Promise<Array<any>>}
     * @async
     * @private
     */
    async _standardSOQLQuery(useTooling, query, byPasses, callback) {
        // Each query can use the tooling or not, se based on that flag we'll use the right JsForce connection
        const conn = useTooling === true ? this._connection.tooling : this._connection;
        // the records to return
        const allRecords = [];
        // If `locator` is undefined, it means we are calling doNextQuery() the first time
        const doNextQuery = async (/** @type {string} */ locator) => {
            // Let's start to check if we are 'allowed' to use the Salesforce API...
            this._watchDog?.beforeRequest(); // if limit has been reached, an error will be thrown here
            let results;
            if (locator === undefined) {
                // Calling the query the first time
                results = await conn.query(query, { 
                    autoFetch: false,
                    headers: { 'Sforce-Query-Options': `batchSize=${MAX_STANDARDSOQL_BATCH_SIZE}` }
                });
            } else {
                // Calling the queryMore
                results = await conn.queryMore(locator);
            }
            // Call the callback for information
            callback(results?.records?.length || 0);
            // Here the call has been made, so we can check if we have reached the limit of Salesforce API usage
            this._watchDog?.afterRequest(); // if limit has been reached, an error will be thrown here
            // Adding records to the global array.
            allRecords.push(... results.records);
            // Check if this was the last batch?
            if (results.done === false) { // this was not yet the last batch
                // call the next Batch
                await doNextQuery(results.nextRecordsUrl);
            }
        };
        try {
            // Call the first time
            await doNextQuery(); // and then the method will chain next calls
            // return the records
            return allRecords;
        } catch (error) {
            if (byPasses && byPasses.includes && byPasses.includes(error.errorCode)) {
                // by pass this error! and return an empty array
                return [];
            } else {
                // Throw the error
                throw Object.assign(error, { 
                    context: { 
                        when: 'While running a SOQL query with the standard queryMore', 
                        what: query 
                }});
            }
        }
    }

    /**
     * @param {boolean} useTooling Use the tooling or not
     * @param {string} query SOQL query string
     * @param {string} field Field name to use for the custom QueryMore
     * @param {Function} callback
     * @returns {Promise<Array<any>>}
     * @async
     * @private
     */
    async _customSOQLQuery(useTooling, query, field, callback) {
        // Each query can use the tooling or not, se based on that flag we'll use the right JsForce connection
        const conn = useTooling === true ? this._connection.tooling : this._connection;
        // the records to return
        const allRecords = [];
        const indexOfFromStatment = query.indexOf(' FROM ');
        const indexOfGroupByStatment = query.indexOf(' GROUP BY ');
        const isAggregateQuery = indexOfGroupByStatment !== -1;
        // Alternative method to queryMore based on ID ordering (inspired by Maroun IMAD!)
        const doNextQuery = async (/** @type {string} */ startingValue) => {
            if (!startingValue && isAggregateQuery === false) {
                startingValue = '000000000000000000';
            }
            let realQuery;
            if (isAggregateQuery === false) {
                realQuery = `${query} AND ${field} > '${startingValue}' ORDER BY ${field} LIMIT ${MAX_NOQUERYMORE_BATCH_SIZE}`;
            } else {
                realQuery = `${query.substring(0, indexOfFromStatment)}, MAX(${field}) qmField `+ // Note that the max field is aliased to "qmField"
                            `${query.substring(indexOfFromStatment, indexOfGroupByStatment)} `+
                            (startingValue ? `WHERE ${field} > ${startingValue} ` : '')+
                            `${query.substring(indexOfGroupByStatment)} `+
                            `ORDER BY MAX(${field}) `+
                            `LIMIT ${MAX_NOQUERYMORE_BATCH_SIZE}`;
            }
            // Let's start to check if we are 'allowed' to use the Salesforce API...
            this._watchDog?.beforeRequest(); // if limit has been reached, an error will be thrown here
            // Deactivate AutoFetch to avoid the automatic call to queryMore by JsForce!
            const results = await conn.query(realQuery, { 
                autoFetch: false,
                headers: { 'Sforce-Query-Options': `batchSize=${MAX_NOQUERYMORE_BATCH_SIZE}` }
            });
            // Call the callback for information
            callback(results?.records?.length || 0);
            // Here the call has been made, so we can check if we have reached the limit of Salesforce API usage
            this._watchDog?.afterRequest(); // if limit has been reached, an error will be thrown here
            // Adding records to the global array.
            allRecords.push(... results.records);
            // Check if this was the last batch?
            if (results.records.length >= MAX_NOQUERYMORE_BATCH_SIZE) { // this was not yet the last batch
                const lastRecord = allRecords[allRecords.length-1];
                if (isAggregateQuery === false) {
                    // call the next Batch with lastRecord field
                    await doNextQuery(lastRecord[field]);
                } else {
                    // if aggregate query, call the next Batch with lastRecord 'qmField' (the alias of "MAX(field)" )'
                    await doNextQuery(lastRecord['qmField']);
                }
            }
        };
        try {
            // Call the first time with a fake Id that will always be first
            await doNextQuery(); // and then the method will chain next calls
            // return the records
            return allRecords;
        } catch (error) {
            // Throw the error
            throw Object.assign(error, { 
                context: { 
                    when: 'While running a SOQL query with the custom queryMore', 
                    what: query 
            }});
        }
    }

    /**
     * @see SalesforceManagerIntf.soqlQuery
     * @param {Array<SalesforceQueryRequest>} queries 
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<Array<Array<any>>>}
     * @public
     */
    async soqlQuery(queries, logger) {
        // Now we can start, log some message
        logger?.log(`Preparing ${queries.length} SOQL ${queries.length>1?'queries':'query'}...`);
        let nbRecords = 0, nbQueryMore = 0;
        const pendingEntities = [], doneEntities = [], errorEntities = [];
        const errors = [];
        const updateLogInformation = () => {
            logger?.log(
                `Processing ${queries.length} SOQL ${queries.length>1?'queries':'query'}... `+
                `🎥 Records retrieved: ${nbRecords}, `+
                `🙌 Number of QueryMore calls done: ${nbQueryMore}, `+
                `⏳ Pending: (${pendingEntities.length}) on [${pendingEntities.join(', ')}], `+
                `✅ Done: (${doneEntities.length}) on [${doneEntities.join(', ')}], `+
                `❌ Error: (${errorEntities.length}) on [${errorEntities.join(', ')}]`
            );
        };
        const updateLogInformationOnQuery = (/** @type {number} */ nbRec) => {
            nbQueryMore++; 
            nbRecords += nbRec;
            updateLogInformation();
        };
            // We'll run the queries in parallel, each query will be mapped as a promise and ran with Promise.allSettled() (and not all() to make sure we properly finish all promises)
        const allSettledPromisesResult = await Promise.allSettled(queries.map(async (query) => {
            // Dynamically get the entityName of the Query
            const str = query.string.lastIndexOf('FROM ')+5;
            const end = query.string.indexOf(' ', str);
            const entityName = query.string.substring(str, end === -1 ? query.string.length : end);
            pendingEntities.push(entityName);
            // Are we doing a custom Query More?
            let records;
            try {
                if (query.queryMoreField) {
                    // yes!! do the custom one based on Ids (for non aggregate queries) -- In case the query does not support queryMore we have an alternative, based on ids
                    records = await this._customSOQLQuery(query.tooling, query.string, query.queryMoreField, updateLogInformationOnQuery);
                } else {
                    // no!!! use the standard one
                    records = await this._standardSOQLQuery(query.tooling, query.string, query.byPasses, updateLogInformationOnQuery);
                }
                doneEntities.push(entityName);
                //nbRecords += records.length;
            } catch (error) {
                errorEntities.push(entityName);
                errors.push(error);
                throw error;
            } finally {
                const index = pendingEntities.indexOf(entityName);
                if (index > -1) pendingEntities.splice(index, 1);
                updateLogInformation();
            }
            return records;
        }));
        logger?.log(`Done running ${queries.length} SOQL ${queries.length>1?'queries':'query'}.`);
        // if errors has at least one item, it means one of the Promises failed
        if (errors.length > 0) {
            return Promise.reject(errors[0]);
        }
        // at this point all promises have been settled (or 'successful' if you)
        const results = allSettledPromisesResult.filter((result) => result.status === 'fulfilled').map((result) => result.value); // filter just to make sure we have only the fulfilled ones!
        // return the results
        return Promise.resolve(results);
    }

    /**
     * @see SalesforceManagerIntf.dependenciesQuery
     * @param {Array<string>} ids
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<{ records: Array<any>, errors: Array<string> }>}
     * @public
     * @async
     */
    async dependenciesQuery(ids, logger) {
        // Let's start to check if we are 'allowed' to use the Salesforce API...
        this._watchDog?.beforeRequest(); // if limit has been reached, an error will be thrown here
        // Now we can start, log some message
        logger?.log(`Starting to call Tooling API for dependency API call of ${ids.length} item(s)...`);
        const bodies = [];
        let currentBody;
        for (let i = 0; i < ids.length; i += MAX_IDS_IN_DAPI_REQUEST_SIZE) {
            if (!currentBody || currentBody.compositeRequest.length === MAX_COMPOSITE_REQUEST_SIZE) {
                currentBody = { allOrNone: false, compositeRequest: [] };
                bodies.push(currentBody);
            }
            const subsetIds = `'${ids.slice(i, i + MAX_IDS_IN_DAPI_REQUEST_SIZE).join("','")}'`;
            currentBody.compositeRequest.push({
                method: 'GET',
                url: `/services/data/v${this._apiVersion}.0/tooling/query?q=`+ // here we need to have the full URI
                        'SELECT MetadataComponentId, MetadataComponentName, MetadataComponentType, '+
                            'RefMetadataComponentId, RefMetadataComponentName, RefMetadataComponentType '+
                        'FROM MetadataComponentDependency '+
                        `WHERE RefMetadataComponentId IN (${subsetIds}) `+
                        `OR MetadataComponentId IN (${subsetIds}) `,
                referenceId: `chunk${i}`
            });
        }
        let nbPending = bodies.length, nbDone = 0, nbErrors = 0;
        const results = await Promise.all(bodies.map(async (body) => {
            try {
                // Call the tooling composite request
                const results = await this._connection.tooling.request({
                    url: `/tooling/composite`, // here JsForce will automatically complete the start of the URI
                    method: 'POST',
                    body: JSON.stringify(body), 
                    headers: { 'Content-Type': 'application/json' }
                });
                // Here the call has been made, so we can check if we have reached the limit of Salesforce API usage
                this._watchDog?.afterRequest(); // if limit has been reached, we reject the promise with a specific error and stop the process
                // Update the stats
                nbDone++;
                // Returning this results
                return results;
            } catch (error) {
                // Update the stats
                nbErrors++;
            } finally {
                // Update the stats
                nbPending--;
                logger?.log(`Processing ${bodies.length} Tooling composite queries... Pending: ${nbPending}, Done: ${nbDone}, Error: ${nbErrors}`);
            }
        }));
        logger?.log(`Got all the results`);
        const dependenciesRecords = []; // dependencies records
        const idsInError = []; // ids contained in a batch that has an error
        const duplicateCheck = new Set(); // Using a set to filter duplicates
        results.forEach((result) => {
            result.compositeResponse.forEach((/** @type {any} */ response) => {
                if (response.httpStatusCode === 200) {
                    logger?.log(`This response had a code: 200 so we add the ${response?.body?.records?.length} records`);
                    dependenciesRecords.push(... response.body.records // multiple response in one batch
                        .map((r) => { // Duplicates will be "null" and will get removed in further filter() call 
                            const id = this.caseSafeId(r.MetadataComponentId);
                            const refId = this.caseSafeId(r.RefMetadataComponentId);
                            const key = `${id}-${refId}`;
                            if (duplicateCheck.has(key)) return null;
                            duplicateCheck.add(key);
                            return {
                                id: id,
                                name: r.MetadataComponentName, 
                                type: r.MetadataComponentType,
                                url: this.setupUrl(id, r.MetadataComponentType),
                                refId: refId, 
                                refName: r.RefMetadataComponentName,
                                refType: r.RefMetadataComponentType,
                                refUrl: this.setupUrl(refId, r.RefMetadataComponentType)
                            }
                        })
                        .filter((r) => r !== null) // Remove duplicates
                    ); 
                } else {
                    const errorCode = response.body[0].errorCode;
                    if (errorCode === 'UNKNOWN_EXCEPTION') {
                        // This is a known issue with the DAPI in case the metadata in the org is messy for one of the IDs
                        logger?.log(`This response had a code: ${errorCode}`);
                        idsInError.push(... ids);
                    } else {
                        logger?.log(`This response had a code: ${errorCode}`);
                        const error = new TypeError(`One of the request had an issue with HTTP errorCode=${errorCode}`);
                        throw Object.assign(error, { 
                            context: { 
                                when: 'Calling Composite Tooling API to get dependencies.',
                                what: {
                                    ids: ids,
                                    body: response.body
                                }
                            }
                        });
                    }
                }
            });
        });
        return { records: dependenciesRecords, errors: idsInError };
    }

    /**
     * @see SalesforceManagerIntf.readMetadata
     * @param {Array<SalesforceMetadataRequest>} metadatas 
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<Map<string, Array<any>>>}
     * @public
     * @async
     */
    async readMetadata(metadatas, logger) {
        // Let's start to check if we are 'allowed' to use the Salesforce API...
        this._watchDog?.beforeRequest(); // if limit has been reached, an error will be thrown here
        // Now we can start, log some message
        logger?.log(`Starting to call Metadata API for ${metadatas.length} types...`);
        // First, if the metadatas contains an item with member='*' we want to list for this type and substitute the '*' with the fullNames
        await Promise.all(
            // only get the types that have at least '*' once
            metadatas.filter((m) => m.members?.includes('*'))
            // then turn this filtered list into a list of promises
            .map(async (metadata) => { // using async as we just want to run parallel processes without manipulating their return values
                try {
                    // each promise will call the List metadata api operation for a specific type
                    const members = await this._connection.metadata.list([{ type: metadata.type }], this._apiVersion);
                    // Here the call has been made, so we can check if we have reached the limit of Salesforce API usage
                    this._watchDog?.afterRequest(); // if limit has been reached, we reject the promise with a specific error and stop the process
                    // clear the members (remove the stars)
                    metadata.members = metadata.members.filter((/** @type {string} */ b) => b !== '*'); // 'metadatas' will be altered!
                    // Add the rerieved fullNames to the members array
                    MAKE_IT_AN_ARRAY(members).forEach(f => { metadata.members.push(f.fullName); }); 
                    // don't return anything we are just altering the metadata.members.
                } catch (error) {
                    logger?.log(`The method metadata.list returned an error: ${JSON.stringify(error)}`);
                    // We reject the promise with the current error and additional context information
                    throw Object.assign(error, { 
                        context: { 
                            when: 'Calling Metadata API to get a list of metadata.',
                            what: {
                                type: metadata.type,
                                apiVersion: this._apiVersion
                            }
                        }
                    });
                }
            })
        );
        // All the promises to list the types have been done and potentially altered the 'metadatas' array
        // At this point, no more wildcard, only types and legitime member values in 'metadatas'.
        // Second, we want to read the metatda for these types and members
        const promises = [];
        const response = new Map(); 
        metadatas.forEach((metadata) => {
            // Init the response array for this type 
            logger?.log(`Init the response array for this type: ${metadata.type}`);
            response.set(metadata.type, []);
            // The API call to Metadata.Read will be done in slice, if for one type we have more than a certain amount 
            // of members we will do more queries
            logger?.log(`Starting looping for type ${metadata.type} and metadata.members.length=${metadata.members.length}`);
            while (metadata.members.length > 0) {
                // Slice the members in batch of MAX_MEMBERS_IN_METADATAAPI_REQUEST_SIZE
                const currentMembers = metadata.members.splice(0, MAX_MEMBERS_IN_METADATAAPI_REQUEST_SIZE); // get the first members
                // These first members have been removed from metadata.members (so next time we don't see them anymore
                promises.push(new Promise(async (resolve, reject) => {
                    logger?.log(`Try to call metadata read for type ${metadata.type} and currentMembers=${currentMembers}`);
                    try {
                        const members = await this._connection.metadata.read(metadata.type, currentMembers);
                        // Here the call has been made, so we can check if we have reached the limit of Salesforce API usage
                        this._watchDog?.afterRequest(); // if limit has been reached, we reject the promise with a specific error and stop the process
                        // Add the received member to the global response (there might be another batch with the same type!)
                        response.get(metadata.type).push(... MAKE_IT_AN_ARRAY(members));
                        resolve();
                    } catch (error) {
                        logger?.log(`The method metadata.read returned an error: ${JSON.stringify(error)}`);
                        // We reject the promise with the current error and additional context information
                        reject(Object.assign(error, { 
                            context: { 
                                when: 'Calling Metadata API to read a list of metadata.',
                                what: {
                                    type: metadata.type,
                                    pendingMembers: metadata.members,
                                    membersInProcess: currentMembers,
                                }
                            }
                        }));
                    }                }));
            }
        }); // Promises are ready to be run
        logger?.log(`Calling all promises: ${promises.length}`);
        await Promise.all(promises); // response will be updated in the promises
        logger?.log(`All promises ended and response is like: ${JSON.stringify(Array.from(response.entries()))}`);
        return response;
    }

    /**
     * @see SalesforceManagerIntf.readMetadataAtScale
     * @param {SimpleLoggerIntf} logger
     * @param {string} type
     * @param {any[]} ids
     * @param {string[]} byPasses
     * @returns {Promise<Array<any>>}
     * @public
     * @async
     */
    async readMetadataAtScale(type, ids, byPasses, logger) {
        // Let's start to check if we are 'allowed' to use the Salesforce API...
        this._watchDog?.beforeRequest(); // if limit has been reached, an error will be thrown here
        const bodies = [];
        let currentBody;
        ids.forEach((id, i) => {
            if (!currentBody || currentBody.compositeRequest.length === MAX_COMPOSITE_REQUEST_SIZE) {
                currentBody = { allOrNone: false, compositeRequest: [] };
                bodies.push(currentBody);
            }
            currentBody.compositeRequest.push({ 
                method: 'GET',
                url: `/services/data/v${this._apiVersion}.0/tooling/sobjects/${type}/${id}`, // here we need to have the full URI
                referenceId: `chunk${i}`
            });
        });
        const results = await Promise.all(bodies.map((body) => {
            // Here the call has been made, so we can check if we have reached the limit of Salesforce API usage
            this._watchDog?.afterRequest(); // if limit has been reached, we reject the promise with a specific error and stop the process
            // Call the tooling composite request
            return this._connection.tooling.request({
                url: `/tooling/composite`, // here JsForce will automatically complete the start of the URI
                method: 'POST',
                body: JSON.stringify(body), 
                headers: { 'Content-Type': 'application/json' }
            });    
        }));
        const records = [];
        results.forEach((result) => {
            result.compositeResponse.forEach((/** @type {any} */ response) => {
                if (response.httpStatusCode === 200) {
                    records.push(response.body); // here only one record per response 
                } else {
                    const errorCode = response.body[0].errorCode;
                    if (byPasses && byPasses.includes && byPasses.includes(errorCode) === false) {
                        const error = new TypeError(`One of the request for type=${type} had an issue with HTTP errorCode=${errorCode}`);
                        throw Object.assign(error, { 
                            context: { 
                                when: 'Calling Composite Tooling API to get metadata at scale.',
                                what: {
                                    type: type,
                                    ids: ids,
                                    body: response.body
                                }
                            }
                        });
                    }
                }
            });
        });
        return records;
    }

    /**
     * @see SalesforceManagerIntf.describeGlobal
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<Array<any>>}
     * @public
     * @async
     */
    async describeGlobal(logger) {
        // Let's start to check if we are 'allowed' to use the Salesforce API...
        this._watchDog?.beforeRequest(); // if limit has been reached, an error will be thrown here
        // Call the global describe
        const response = await this._connection.describeGlobal();
        // Adding support of the Activity object from describe
        response.sobjects.push(ACTIVITY_OBJECT_THAT_SHOULD_BE_RETURNED_BY_DESCRIBE);
        // Here the call has been made, so we can check if we have reached the limit of Salesforce API usage
        this._watchDog?.afterRequest(); // if limit has been reached, an error will be thrown here
        // return the sobjects property
        return response.sobjects;
    }

    /**
     * @see SalesforceManagerIntf.describe
     * @param {string} sobjectDevName 
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<any>}
     * @public
     * @async
     */
    async describe(sobjectDevName, logger) {
        // Adding support of the Activity object from describe
        if (sobjectDevName === 'Activity') return ACTIVITY_OBJECT_THAT_SHOULD_BE_RETURNED_BY_DESCRIBE;
        // Let's start to check if we are 'allowed' to use the Salesforce API...
        this._watchDog?.beforeRequest(); // if limit has been reached, an error will be thrown here
        const object = await this._connection.describe(sobjectDevName);
        // Here the call has been made, so we can check if we have reached the limit of Salesforce API usage
        this._watchDog?.afterRequest(); // if limit has been reached, an error will be thrown here
        // return the object as it is
        return object;
    }
    
    /**
     * @see SalesforceManagerIntf.recordCount
     * @param {string} sobjectDevName 
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<number>}
     * @public
     * @async
     */
    async recordCount(sobjectDevName, logger) {
        // Let's start to check if we are 'allowed' to use the Salesforce API...
        this._watchDog?.beforeRequest(); // if limit has been reached, an error will be thrown here
        const result = await this._connection.request({ 
            url: `/limits/recordCount?sObjects=${sobjectDevName}`, 
            method: 'GET' 
        });
        // Here the call has been made, so we can check if we have reached the limit of Salesforce API usage
        this._watchDog?.afterRequest(); // if limit has been reached, an error will be thrown here
        // return the first item of the sobjects property
        return (Array.isArray(result?.sObjects) && result?.sObjects.length === 1) ? result?.sObjects[0].count : 0;
    }

    /**
     * @see SalesforceManagerIntf.runAllTests
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<string>}
     * @public
     * @async
     */ 
    async runAllTests(logger) {
        // Let's start to check if we are 'allowed' to use the Salesforce API...
        this._watchDog?.beforeRequest(); // if limit has been reached, an error will be thrown here
        const result = await this._connection.request({ 
            url: `/tooling/runTestsAsynchronous`,
            method: 'POST',
            body: '{ "testLevel": "RunLocalTests", "skipCodeCoverage": false }', // double quote is mandatory by SFDC Json parser.
            headers: { 'Content-Type': 'application/json' }
        });
        // Here the call has been made, so we can check if we have reached the limit of Salesforce API usage
        this._watchDog?.afterRequest(); // if limit has been reached, an error will be thrown here
        // return the result as it is
        return result;
    }

    /**
     * @see SalesforceManagerIntf.compileClasses
     * @param {Array<string>} apexClassIds
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<Array<any>>}
     * @public
     * @async
     */ 
    async compileClasses(apexClassIds, logger) {
        // Let's start to check if we are 'allowed' to use the Salesforce API...
        this._watchDog?.beforeRequest(); // if limit has been reached, an error will be thrown here
        // Get the source code of the given classes
        const apexClasses = await this.readMetadataAtScale(SalesforceMetadataTypes.APEX_CLASS, apexClassIds, [], logger);
        // Check another time the limit
        this._watchDog?.beforeRequest(); // if limit has been reached, an error will be thrown here
        const timestamp = Date.now();
        const bodies = [];
        let currentBody;
        let countBatches = 0;
        apexClasses.filter(apexClass => apexClass.Body).forEach((apexClass) => {
            if (!currentBody || currentBody.compositeRequest.length === MAX_COMPOSITE_REQUEST_SIZE) {
                countBatches++;
                currentBody = {
                    allOrNone: false,
                    compositeRequest: [
                        {
                            method: 'POST',
                            url: `/services/data/v${this._apiVersion}.0/tooling/sobjects/MetadataContainer`,
                            referenceId: 'container',
                            body: { Name : `container-${timestamp}-${countBatches}` }
                        },
                        {
                            method: 'POST',
                            url: `/services/data/v${this._apiVersion}.0/tooling/sobjects/ContainerAsyncRequest`,
                            referenceId: 'request',
                            body: { MetadataContainerId: '@{container.id}', IsCheckOnly: true }
                        }
                    ]
                };
                bodies.push(currentBody);
            }
            currentBody.compositeRequest.push({ 
                method: 'POST',
                url: `/services/data/v${this._apiVersion}.0/tooling/sobjects/ApexClassMember`, 
                referenceId: apexClass.Id,
                body: { MetadataContainerId: '@{container.id}', ContentEntityId: apexClass.Id, Body: apexClass.Body }
            });
        });
        const promises = bodies.map((body) => {
            // Here the call has been made, so we can check if we have reached the limit of Salesforce API usage
            this._watchDog?.afterRequest(); // if limit has been reached, we reject the promise with a specific error and stop the process
            // Call the tooling composite request
            return this._connection.tooling.request({
                url: `/tooling/composite`,
                method: 'POST',
                body: JSON.stringify(body), 
                headers: { 'Content-Type': 'application/json' }
            });    
        });
        const finalResult = await Promise.all(promises);
        // Here the call has been made, so we can check if we have reached the limit of Salesforce API usage
        this._watchDog?.afterRequest(); // if limit has been reached, an error will be thrown here
        // return the final result as it is
        return finalResult;
    }
}

/** 
 * @description Metadata API returns an array or a single object!
 * @param {any} data
 * @returns {Array<any>}
 * @private
 */
const MAKE_IT_AN_ARRAY = (/** @type {any} */ data) => data ? (Array.isArray(data) ? data : [ data ]) : []; 

/**
 * @description Activity object that is not present in the describe API
 * @type {any}
 * @private
 */
const ACTIVITY_OBJECT_THAT_SHOULD_BE_RETURNED_BY_DESCRIBE = {
    name: 'Activity',
    label: 'Activity',
    labelPlural: 'Activities',
    customSetting: false,
    custom: false,
    keyPrefix: '00T'
};

/**
 * @description Org Check API main class
 */
class API {

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
            if (allNodes.has(role.id) === false) { allNodes.set(role.id, { id: role.id }); }
            // get a reference to this node
            const node = allNodes.get(role.id);
            // if that node just got registered, it has no 'record' yet
            // if that node was previously a parent (and got registered at that time), it has no 'record' yet
            if (!node.record) node.record = role; // for this reasons, we set the record property if not set
            // get the id of its parent (if no parent using the artificial 'root' node)
            const parentId = role.hasParent === true ? role.parentId : ROOT_KEY;
            // is the parent already registered? if false create (with no record!) and set in the map
            if (allNodes.has(parentId) === false) { allNodes.set(parentId, { id: parentId }); }
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

export { API, BasicLoggerIntf, CodeScanner, Data, DataCacheItem, DataCacheManagerIntf, DataDependencies, DataDependenciesFactory, DataDependencyItem, DataFactoryInstanceIntf, DataFactoryIntf, DataItemInCache, DataMatrix, DataMatrixColumnHeader, DataMatrixFactory, DataMatrixRow, DataMatrixWorking, DataWithDependencies, DataWithoutScoring, Dataset, DatasetAliases, DatasetManagerIntf, DatasetRunInformation, ItemInCache, LoggerIntf, MetadataItemInCache, OBJECTTYPE_ID_CUSTOM_BIG_OBJECT, OBJECTTYPE_ID_CUSTOM_EVENT, OBJECTTYPE_ID_CUSTOM_EXTERNAL_SOBJECT, OBJECTTYPE_ID_CUSTOM_METADATA_TYPE, OBJECTTYPE_ID_CUSTOM_SETTING, OBJECTTYPE_ID_CUSTOM_SOBJECT, OBJECTTYPE_ID_KNOWLEDGE_ARTICLE, OBJECTTYPE_ID_STANDARD_SOBJECT, Processor, Recipe, RecipeAliases, RecipeManagerIntf, SFDC_ApexClass, SFDC_ApexTestMethodResult, SFDC_ApexTrigger, SFDC_AppPermission, SFDC_Application, SFDC_CustomLabel, SFDC_Field, SFDC_FieldPermission, SFDC_FieldSet, SFDC_Flow, SFDC_FlowVersion, SFDC_Group, SFDC_LightningAuraComponent, SFDC_LightningPage, SFDC_LightningWebComponent, SFDC_Limit, SFDC_Object, SFDC_ObjectPermission, SFDC_ObjectRelationShip, SFDC_ObjectType, SFDC_Organization, SFDC_Package, SFDC_PageLayout, SFDC_PermissionSet, SFDC_PermissionSetLicense, SFDC_Profile, SFDC_ProfileIpRangeRestriction, SFDC_ProfileLoginHourRestriction, SFDC_ProfilePasswordPolicy, SFDC_ProfileRestrictions, SFDC_RecordType, SFDC_User, SFDC_UserRole, SFDC_ValidationRule, SFDC_VisualForceComponent, SFDC_VisualForcePage, SFDC_WebLink, SFDC_Workflow, SalesforceManagerIntf, SalesforceMetadataRequest, SalesforceMetadataTypes, SalesforceQueryRequest, SalesforceUsageInformation, SalesforceWatchDog, ScoreRule, SecretSauce, SimpleLoggerIntf };
