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

    /**
     * @description Category of the rule
     * @type {string}
     * @public
     */
    category;
}

/**
 * @description Data factory interface
 * @public
 */
export class DataFactoryIntf {

    /**
     * @description Get the instance of the factiry for a given data class
     * @param {any} dataClass - The class of the data for which we want to get the factory instance
     * @returns {DataFactoryInstanceIntf | undefined} Returns the instance of the factory for the given data class
     * @throws if the given dataClass is not an instance of Data or DataWithoutScoring
     * @public
     */
    getInstance(dataClass) { throw new Error(`Method getInstance(dataClass=${dataClass}) not implemented yet.`); }   
}

export class DataFactoryInstanceCreateSetup {

    /** 
     * @description List of properties and values to create a new instance
     * @type {any}
     */
    properties;
}

export class DataFactoryInstanceCreateSetup_WithDependencies extends DataFactoryInstanceCreateSetup{

    /** 
     * @description Data Dependencies for the new instance
     * @type {DataDependencies}
     */
    dependencyData;

    /** 
     * @description Data Dependencies for the new instance
     * @type {Array<string>}
     */
    dependencyIdFields = [];
}

/**
 * @description Data factory interface for a given data class
 * @public
 */
export class DataFactoryInstanceIntf {

    /**
     * @description Creates a new instance of the given data class without computing the score
     * @param {DataFactoryInstanceCreateSetup | DataFactoryInstanceCreateSetup_WithDependencies} setup - The setup containing properties to create a new instance
     * @returns {any} Returns the new row with no score
     * @public
     */
    create(setup) { throw new Error(`Method create(setup=${setup}) not implemented yet.`); }   

    /**
     * @description Computes the score on an existing row
     * @param {any} row - The row to compute the score on
     * @returns {any} Returns the given row with computed score
     * @public
     */
    computeScore(row) { throw new Error(`Method computeScore(row=${row}) not implemented yet.`); }   

    /**
     * @description Creates a new instance of the given data class AND computes the score
     * @param {DataFactoryInstanceCreateSetup | DataFactoryInstanceCreateSetup_WithDependencies} setup - The setup containing properties to create a new instance
     * @returns {any} Returns the new row with computed score
     * @public
     */
    createWithScore(setup) { throw new Error(`Method createWithScore(setup=${setup}) not implemented yet.`); }   
}