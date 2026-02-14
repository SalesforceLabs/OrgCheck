import { SalesforceError } from "./orgcheck-api-salesforcemanager";

/**
 * @description Threshold value when percentage is reaching a "warning" zone (not yet a "critical" zone)
 * @type {number}
 * @private
 */
const DAILY_API_REQUEST_WARNING_THRESHOLD: number = 0.70; // =70%
 
/**
 * @description Threshold value when percentage is reaching a "critical" zone.
 * @type {number}
 * @private
 */
const DAILY_API_REQUEST_FATAL_THRESHOLD: number = 0.90; // =90%

/**
 * @description If limit information are older than this, force a refresh
 * @type {number}
 * @private
 */
const IF_LIMIT_INFO_ARE_OLDER_THAN_THIS_FORCE_REFRESH: number = 1*60*1000; // =1 minute

/**
 * @description Information about the current Daily API Request usage limit
 */
export class SalesforceUsageInformation {

    /**
     * @description Current ratio (not percentage!) of Daily API Request limit usage
     * @type {number}
     * @public
     */
    currentUsageRatio: number = 0;

    /**
     * @description Current percentage of Daily API Request limit usage
     * @type {string}
     * @public
     */
    currentUsagePercentage: string = '';

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
export class SalesforceWatchDog {

    /**
     * @description Constructor
     * @param {() => { used: number, max: number }} apiLimitExtractor - How we extract the API Limit information from Salesforce.
     * @public
     */
    constructor(apiLimitExtractor: () => { used: number; max: number; }) {
        this._apiLimitExtractor = apiLimitExtractor;
        this._lastRequestToSalesforce = undefined;
        this._lastApiUsage = new SalesforceUsageInformation();
    }

    /**
     * @description Function that knows how to return the current API limit usage
     * @type {() => { used: number, max: number }}
     * @private
     */
    _apiLimitExtractor: () => { used: number; max: number; };

    /**
     * @description Timestamp of the last request we have made to Salesforce.
     *   Why we do this? to better appreciate the limitInfo we have from the last request.
     *   If the information is fresh then no need to ask again the API, if not we need to try calling.
     * @type {number}
     * @private
     */
    _lastRequestToSalesforce: number;

    /**
     * @description Last ratio the Salesforce API gave us about the Daily API Request. 
     * @type {SalesforceUsageInformation}
     * @private
     */
    _lastApiUsage: SalesforceUsageInformation;

    /**
     * @description Before calling the Salesforce API, this is a watch dog to make sure we don't exceed the daily API request limit
     * @param {Function} [callback] - Optional callback to call if we reach the limit
     * @throws {SalesforceError} If we reach the limit
     * @public
     */
    beforeRequest(callback?: Function) {
        if (this._lastRequestToSalesforce && 
            Date.now() - this._lastRequestToSalesforce <= IF_LIMIT_INFO_ARE_OLDER_THAN_THIS_FORCE_REFRESH && 
            this._lastApiUsage.isRedZone
        ) {
            const error = new SalesforceError(
                `The Daily API Request limit has been reached. We cannot continue.`,
                'WATCH_DOG', 
                { 
                    'CurrentUsagePercentage': this._lastApiUsage.currentUsagePercentage, 
                    'CurrentUsageRatio': this._lastApiUsage.currentUsageRatio, 
                    'ThresholdPercentage': this._lastApiUsage.redThresholdPercentage 
                }
            );
            if (callback) callback(error); 
            throw error;
        }
    }

    /**
     * @description After calling the Salesforce API, this is a watch dog to make sure we don't exceed the daily API request limit
     * @param {Function} [callback] - Optional callback to call if we reach the limit
     * @throws {SalesforceError} If we reach the limit
     * @public
     */
    afterRequest(callback?: Function) {
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
    get dailyApiRequestLimitInformation(): SalesforceUsageInformation {
        return this._lastApiUsage;
    }
}

/**
 * @description Return the percentage representation of a ratio as a string (without the percentage sign)
 * @param {number} ratio - The ratio to convert to a percentage
 * @param {number} [decimals] - The number of decimals to keep in the percentage (default is 2)
 * @returns {string} String representation of the percentage
 * @private
 */
const RATIO_TO_PERCENTAGE = (ratio: number, decimals: number=2): string => {
    return (ratio*100).toFixed(decimals);
}