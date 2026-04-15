import { DataWithScore } from 'src/api/core/data/orgcheck-api-data';

export interface DataCollectionStatisticsIntf {

    /**
     * @description Alias of the corresponding recipe
     * @type {string}
     * @public
     */
    recipeAlias: string;

    /**
     * @description Title of the corresponding recipe
     * @type {string}
     * @public
     */
    recipeTitle: string;

    /** 
     * @description Indicates if an error occurred while building the collection
     * @type {boolean}
     * @public
     */
    hadError: boolean;

    /** 
     * @description Last error message if any
     * @type {string}
     * @public
     */
    lastErrorMessage: string;

    /** 
     * @description Number of all records
     * @type {number}
     * @public
     */
    countAll: number;

    /** 
     * @description Number of records that are considered "bad" (i.e. at least one bad reason id)
     * @type {number}
     * @public
     */
    countBad: number;

    /** 
     * @description Number of records that are considered "good" (i.e. no bad reason ids)
     * @type {number}
     * @public
     */
    countGood: number;

    /**
     * @description Number of bad records by rule
     * @type {{ruleId: number, ruleName: string, count: number}[]}
     * @default []
     * @public
     */
    countBadByRule: { ruleId: number; ruleName: string; count: number; }[];

    /**
     * @description List of distinct values automatically computed based on the rule description
     * @type {any[]}
     * @public
     */
    distinctBadValues: any[];

    /**
     * @description List of bad items id, name and url
     * @type {DataWithScore[]}
     * @public
     */
    badItems: DataWithScore[];

    /**
     * @description List of all data items that are part of this collection
     * @type {DataWithScore[]}
     * @default []
     * @public
     */ 
    allData: DataWithScore[];
}