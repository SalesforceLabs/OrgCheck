import { DataCollectionStatisticsIntf } from 'src/api/core/orgcheck-api-data-datacollectionstats';
import { Data } from 'src/api/core/orgcheck-api-data';
import { SimpleLoggerIntf } from 'src/api/core/orgcheck-api-logger';

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

export class DataCollectionStatisticsOK implements DataCollectionStatisticsIntf {
    
    /**
     * @description Constructor
     * @param recipeName Name of the corresponding recipe
     */
    constructor(recipeName: string, countAll: number, countBad: number, countBadByRule: { ruleId: number; ruleName: string; count: number; }[], data: Data[]) {
        this.recipeName = recipeName;
        this.hadError = false;
        this.lastErrorMessage = '';
        this.countAll = countAll;
        this.countBad = countBad;
        this.countGood = countAll - countBad;
        this.countBadByRule = countBadByRule;
        this.data = data;
    }

    /**
     * @description Name of the corresponding recipe
     * @type {string}
     * @public
     */
    public readonly recipeName: string;

    /** 
     * @description Indicates if an error occurred while building the collection
     * @type {boolean}
     * @public
     */
    public readonly hadError: boolean;

    /** 
     * @description Last error message if any
     * @type {string}
     * @public
     */
    public readonly lastErrorMessage: string;

    /** 
     * @description Number of all records
     * @type {number}
     * @public
     */
    public readonly countAll: number;

    /** 
     * @description Number of records that are considered "bad" (i.e. at least one bad reason id)
     * @type {number}
     * @public
     */
    public readonly countBad: number;

    /** 
     * @description Number of records that are considered "good" (i.e. no bad reason ids)
     * @type {number}
     * @public
     */
    public readonly countGood: number;

    /**
     * @description Number of bad records by rule
     * @type {Array<{ruleId: number, ruleName: string, count: number}>}
     * @default []
     * @public
     */
    public readonly countBadByRule: Array<{ ruleId: number; ruleName: string; count: number; }>;

    /**
     * @description List of all data items that are part of this collection
     * @type {Array<Data>}
     * @default []
     * @public
     */ 
    public readonly data: Array<Data>;
}

export class DataCollectionStatisticsWithError implements DataCollectionStatisticsIntf {
    
    /**
     * @description Constructor
     * @param recipeName Name of the corresponding recipe
     */
    constructor(recipeName: string, lastErrorMessage: string) {
        this.recipeName = recipeName;
        this.hadError = true;
        this.lastErrorMessage = lastErrorMessage;
        this.countAll = 0;
        this.countGood = 0;
        this.countBad = 0;
        this.countBadByRule = [];
        this.data = [];
    }

    /**
     * @description Name of the corresponding recipe
     * @type {string}
     * @public
     */
    public readonly recipeName: string;

    /** 
     * @description Indicates if an error occurred while building the collection
     * @type {boolean}
     * @public
     */
    public readonly hadError: boolean;

    /** 
     * @description Last error message if any
     * @type {string}
     * @public
     */
    public readonly lastErrorMessage: string;

    /** 
     * @description Number of all records
     * @type {number}
     * @public
     */
    public readonly countAll: number;

    /** 
     * @description Number of records that are considered "bad" (i.e. at least one bad reason id)
     * @type {number}
     * @public
     */
    public readonly countBad: number;

    /** 
     * @description Number of records that are considered "good" (i.e. no bad reason ids)
     * @type {number}
     * @public
     */
    public readonly countGood: number;

    /**
     * @description Number of bad records by rule
     * @type {Array<{ruleId: number, ruleName: string, count: number}>}
     * @default []
     * @public
     */
    public readonly countBadByRule: Array<{ ruleId: number; ruleName: string; count: number; }>;

    /**
     * @description List of all data items that are part of this collection
     * @type {Array<Data>}
     * @default []
     * @public
     */ 
    public readonly data: Array<Data>;
}