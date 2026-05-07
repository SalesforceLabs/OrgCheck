import { DataDependencies } from 'src/api/core/data/orgcheck-api-data-dependencies';
import { DataAliases } from 'src/api/core/data/orgcheck-api-data-aliases';

/**
 * @description Data factory interface
 * @public
 */
export interface DataFactoryIntf {

    /**
     * @description Get the instance of the factiry for a given data class
     * @param {DataAliases} dataClass - The class of the data for which we want to get the factory instance
     * @returns {DataFactoryInstanceIntf | undefined} Returns the instance of the factory for the given data class
     * @throws if the given dataClass is not an instance of Data or DataWithoutScoring
     * @public
     */
    getInstance(dataClass: DataAliases): DataFactoryInstanceIntf;
}

export interface DataFactoryInstanceCreateSetup {

    /** 
     * @description List of properties and values to create a new instance
     * @type {any}
     */
    properties: Record<string, unknown>;
}

export interface DataFactoryInstanceCreateSetup_WithDependencies extends DataFactoryInstanceCreateSetup {

    /** 
     * @description Data Dependencies for the new instance
     * @type {DataDependencies}
     */
    dependencyData: DataDependencies;

    /** 
     * @description Data Dependencies for the new instance
     * @type {string[]}
     */
    dependencyIdFields: string[];
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
    create<T = Record<string, unknown>>(setup: DataFactoryInstanceCreateSetup | DataFactoryInstanceCreateSetup_WithDependencies): T;

    /**
     * @description Computes the score on an existing row
     * @param {Record<string, unknown>} row - The row to compute the score on
     * @returns {Record<string, unknown>} Returns the given row with computed score
     * @public
     */
    computeScore(row: unknown): Record<string, unknown>;

    /**
     * @description Creates a new instance of the given data class AND computes the score
     * @param {DataFactoryInstanceCreateSetup | DataFactoryInstanceCreateSetup_WithDependencies} setup - The setup containing properties to create a new instance
     * @returns {Record<string, unknown>} Returns the new row with computed score
     * @public
     */
    createWithScore<T = Record<string, unknown>>(setup: DataFactoryInstanceCreateSetup | DataFactoryInstanceCreateSetup_WithDependencies): T;
}