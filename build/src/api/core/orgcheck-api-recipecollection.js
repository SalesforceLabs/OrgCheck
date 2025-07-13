import { Data } from "./orgcheck-api-data";
import { SimpleLoggerIntf } from "./orgcheck-api-logger";

/**
 * @description The super class for recipe collections that are defined only by executing a set of other recipes
 */
export class RecipeCollection {

    /**
     * @description List all recipe aliases that this recipe collection needs
     * @param {SimpleLoggerIntf} logger - Logger
     * @param {Map<string, any> | undefined} [parameters] - List of optional argument to pass
     * @returns {Array<string> | undefined} List of recipe aliases that this recipe collection needs
     * @public
     */
    extract(logger, parameters) { throw new Error(`Method extract(logger=${logger}, parameters=${parameters}) not implemented yet.`); }

    /**
     * @description Filter the data items by score rule ids
     * @param {SimpleLoggerIntf} logger - Logger
     * @param {Map<string, any> | undefined} [parameters] - List of optional argument to pass
     * @returns {Array<number> | undefined} List of score rule ids to filter by or undefined if no filtering is needed
     * @public
     */ 
    filterByScoreRuleIds(logger, parameters) { throw new Error(`Method extract(logger=${logger}, parameters=${parameters}) not implemented yet.`); }
}

export class DataCollectionStatistics {

    /** 
     * @description Number of all records
     * @type {number}
     * @public
     */
    countAll;

    /** 
     * @description Number of records that are considered "bad" (i.e. at least one bad reason id)
     * @type {number}
     * @public
     */
    countBad;

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
     * @public
     */
    countBadByRule;

    /**
     * @description List of all data items that are part of this collection
     * @type {Array<Data>}
     * @public
     */ 
    data;
}