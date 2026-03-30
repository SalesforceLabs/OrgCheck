import { DataCollectionStatisticsIntf } from 'src/api/core/orgcheck-api-data-datacollectionstats';
import { Data } from 'src/api/core/orgcheck-api-data';
import { SimpleLoggerIntf } from 'src/api/core/orgcheck-api-logger';
import { ScoreRule } from 'src/api/data/orgcheck-api-data-scorerule';

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
    ingredients(logger: SimpleLoggerIntf, parameters?: Map<string, any>): Array<string>;

    /**
     * @description List the parameters that this recipe collection dependes on
     * @returns {string[]} List of parameters that this recipe collection dependes on
     * @public
     */
    ingredientsDependencies(): string[];

    /**
     * @description Filter the data items by score rules
     * @param {SimpleLoggerIntf} logger - Logger
     * @param {Map<string, any>} [parameters] - List of optional argument to pass
     * @returns {Array<ScoreRule>} List of score rule to filter by. Empty array means no filtering
     * @public
     */ 
    filterByScoreRules(logger: SimpleLoggerIntf, parameters?: Map<string, any>): Array<ScoreRule>;
}

export class DataCollectionStatisticsOK implements DataCollectionStatisticsIntf {
    
    /**
     * @description Constructor
     * @param recipeName Name of the corresponding recipe
     */
    constructor(public readonly recipeName: string, public readonly countAll: number, public readonly countBad: number, 
        public readonly countBadByRule: { ruleId: number; ruleName: string; count: number; }[], 
        public readonly distinctBadValues: any[], public readonly data: Data[]) {
        this.countGood = countAll - countBad;
    }

    /** 
     * @description Indicates if an error occurred while building the collection
     * @type {boolean}
     * @public
     */
    public readonly hadError: boolean = false;

    /** 
     * @description Last error message if any
     * @type {string}
     * @public
     */
    public readonly lastErrorMessage: string = '';

    /** 
     * @description Number of records that are considered "good" (i.e. no bad reason ids)
     * @type {number}
     * @public
     */
    public readonly countGood: number;
}

export class DataCollectionStatisticsWithError implements DataCollectionStatisticsIntf {
    
    /**
     * @description Constructor
     * @param recipeName Name of the corresponding recipe
     */
    constructor(public readonly recipeName: string, public readonly lastErrorMessage: string) { }

    /** 
     * @description Indicates if an error occurred while building the collection
     * @type {boolean}
     * @public
     */
    public readonly hadError: boolean = true;

    /** 
     * @description Number of all records
     * @type {number}
     * @public
     */
    public readonly countAll: number = 0;

    /** 
     * @description Number of records that are considered "bad" (i.e. at least one bad reason id)
     * @type {number}
     * @public
     */
    public readonly countBad: number = 0;

    /** 
     * @description Number of records that are considered "good" (i.e. no bad reason ids)
     * @type {number}
     * @public
     */
    public readonly countGood: number = 0;

    /**
     * @description Number of bad records by rule
     * @type {Array<{ruleId: number, ruleName: string, count: number}>}
     * @default []
     * @public
     */
    public readonly countBadByRule: Array<{ ruleId: number; ruleName: string; count: number; }> = [];

    /**
     * @description List of distinct values automatically computed based on the rule description
     * @type {Array<any>}
     * @public
     */
    distinctBadValues: Array<any> = [];

    /**
     * @description List of all data items that are part of this collection
     * @type {Array<Data>}
     * @default []
     * @public
     */ 
    public readonly data: Array<Data> = [];
}