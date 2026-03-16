import { Data } from 'src/api/core/orgcheck-api-data';

export interface DataCollectionStatisticsIntf {

    /**
     * @description Name of the corresponding recipe
     * @type {string}
     * @public
     */
    recipeName: string;

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
     * @type {Array<{ruleId: number, ruleName: string, count: number}>}
     * @default []
     * @public
     */
    countBadByRule: Array<{ ruleId: number; ruleName: string; count: number; }>;

    /**
     * @description List of all data items that are part of this collection
     * @type {Array<Data>}
     * @default []
     * @public
     */ 
    data: Array<Data>;
}