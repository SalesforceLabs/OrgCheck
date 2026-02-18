import { Data } from "./orgcheck-api-data";
import { SimpleLoggerIntf } from "./orgcheck-api-logger";

/**
 * @description The super class for recipe collections that are defined only by executing a set of other recipes
 */
export interface RecipeCollection {

    /**
     * @description List all recipe aliases that this recipe collection needs
     * @param {SimpleLoggerIntf} logger - Logger
     * @param {Map<string, any>} [parameters] - List of optional argument to pass
     * @returns {Array<string>} List of recipe aliases that this recipe collection needs
     * @public
     */
    extract(logger: SimpleLoggerIntf, parameters?: Map<string, any>): Array<string>;

    /**
     * @description Filter the data items by score rule ids
     * @param {SimpleLoggerIntf} logger - Logger
     * @param {Map<string, any>} [parameters] - List of optional argument to pass
     * @returns {Array<number>} List of score rule ids to filter by. Empty array means no filtering
     * @public
     */ 
    filterByScoreRuleIds(logger: SimpleLoggerIntf, parameters?: Map<string, any>): Array<number>;
}

export class DataCollectionStatistics {

    /** 
     * @description Indicates if an error occurred while building the collection
     * @type {boolean}
     * @default false
     * @public
     */
    hadError: boolean = false;

    /** 
     * @description Last error message if any
     * @type {string}
     * @public
     */
    lastErrorMessage: string = '';

    /** 
     * @description Number of all records
     * @type {number}
     * @default 0
     * @public
     */
    countAll: number = 0;

    /** 
     * @description Number of records that are considered "bad" (i.e. at least one bad reason id)
     * @type {number}
     * @default 0
     * @public
     */
    countBad: number = 0;

    /** 
     * @description Number of records that are considered "good" (i.e. no bad reason ids)
     * @type {number}
     * @public
     */
    get countGood() {
        return this.countAll - this.countBad;
    }

    /**
     * @description Number of bad records by rule
     * @type {Array<{ruleId: number, ruleName: string, count: number}>}
     * @default []
     * @public
     */
    countBadByRule: Array<{ ruleId: number; ruleName: string; count: number; }> = [];

    /**
     * @description List of all data items that are part of this collection
     * @type {Array<Data>}
     * @default []
     * @public
     */ 
    data: Array<Data> = [];
}