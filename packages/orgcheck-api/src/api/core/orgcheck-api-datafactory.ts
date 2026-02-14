import { DataDependencies } from "./orgcheck-api-data-dependencies";

/**
 * @description Org Check "score rule" used to qualify if an item is bad or not
 * @public
 */
export class ScoreRule {

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
     * @type {Array<any>}
     * @public
     */    
    applicable: Array<any>;

    /**
     * @description Category of the rule
     * @type {string}
     * @public
     */
    category: string;
}

/**
 * @description Data factory interface
 * @public
 */
export interface DataFactoryIntf {

    /**
     * @description Get the instance of the factiry for a given data class
     * @param {any} dataClass - The class of the data for which we want to get the factory instance
     * @returns {DataFactoryInstanceIntf | undefined} Returns the instance of the factory for the given data class
     * @throws if the given dataClass is not an instance of Data or DataWithoutScoring
     * @public
     */
    getInstance(dataClass: any): DataFactoryInstanceIntf;
}

export class DataFactoryInstanceCreateSetup {

    /** 
     * @description List of properties and values to create a new instance
     * @type {any}
     */
    properties: any;
}

export class DataFactoryInstanceCreateSetup_WithDependencies extends DataFactoryInstanceCreateSetup {

    /** 
     * @description Data Dependencies for the new instance
     * @type {DataDependencies}
     */
    dependencyData: DataDependencies;

    /** 
     * @description Data Dependencies for the new instance
     * @type {Array<string>}
     */
    dependencyIdFields: Array<string> = [];
}

/**
 * @description Data factory interface for a given data class
 * @public
 */
export interface DataFactoryInstanceIntf {

    /**
     * @description Creates a new instance of the given data class without computing the score
     * @param {DataFactoryInstanceCreateSetup | DataFactoryInstanceCreateSetup_WithDependencies} setup - The setup containing properties to create a new instance
     * @returns {any} Returns the new row with no score
     * @public
     */
    create(setup: DataFactoryInstanceCreateSetup | DataFactoryInstanceCreateSetup_WithDependencies): any;

    /**
     * @description Computes the score on an existing row
     * @param {any} row - The row to compute the score on
     * @returns {any} Returns the given row with computed score
     * @public
     */
    computeScore(row: any): any;

    /**
     * @description Creates a new instance of the given data class AND computes the score
     * @param {DataFactoryInstanceCreateSetup | DataFactoryInstanceCreateSetup_WithDependencies} setup - The setup containing properties to create a new instance
     * @returns {any} Returns the new row with computed score
     * @public
     */
    createWithScore(setup: DataFactoryInstanceCreateSetup | DataFactoryInstanceCreateSetup_WithDependencies): any;
}