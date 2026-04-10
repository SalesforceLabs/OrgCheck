import { DataAliases } from "./data/orgcheck-api-data-aliases";

/**
 * @description Org Check "score rule" used to qualify if an item is bad or not
 * @public
 */
export interface ScoreRule {

    /**
     * @description Unique identifier of that rule
     * @type {number}
     * @public
     */
    id: number;

    /**
     * @description Description of that rule
     * @type {string}
     * @public
     */
    description: string;
    
    /**
     * @description Rule's formula with the data as only parameter. Function returns true or false.
     * @type {Function}
     * @public
     */
    formula: Function;

    /**
     * @description Message to show if the formula returns false for a given data.
     * @type {string}
     * @public
     */
    errorMessage: string;

    /**
     * @description Technical name of the field that is considered 'bad'
     * @type {string}
     * @public
     */    
    badField: string;

    /**
     * @description For which data this rule is applicable?
     * @type {any[]}
     * @public
     */    
    applicable: DataAliases[];

    /**
     * @description Category of the rule
     * @type {string}
     * @public
     */
    category: string;
}
