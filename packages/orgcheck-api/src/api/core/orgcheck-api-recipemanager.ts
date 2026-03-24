import { Data } from 'src/api/core/orgcheck-api-data';
import { DataMatrixIntf } from 'src/api/core/orgcheck-api-data-matrix';
import { DataCollectionStatisticsIntf } from './orgcheck-api-data-datacollectionstats';
import { Recipe } from 'src/api/core/orgcheck-api-recipe';

/**
 * @description Recipe manager error class
 */
export class RecipeManagerError extends Error {
    
    constructor(public readonly recipe: string, message: string, public readonly cause?: Error) {
        super(message);
    }
}

/**
 * @description Shortcut for any type of data returned by recipes stored by this manager
 */
export type AnyRecipeData = Data | Data[] | DataMatrixIntf | Map<string, boolean>;

/**
 * @description Shortcut for any type of data returned by recipe collections stored by this manager
 */
export type AnyRecipeCollectionData = DataCollectionStatisticsIntf[];

/**
 * @description Shortcut for any type of recipes that the manager can handle at this time
 */
export type AnyRecipe = Recipe<AnyRecipeData>;

/**
 * @description Recipe Manager interface
 */ 
export interface RecipeManagerIntf {

    /**
     * @description Runs a designated recipe (by its alias)
     *   - Step 1. Extract the list of datasets to run that this recipe uses
     *   - Step 2. Run the given datasets and gather the global data retrieved
     *   - Step 3. Transform the retrieved data and return the final result as a Map
     * @param {string} alias - String representation of a recipe -- use one of the RECIPE_*_ALIAS constants available in this unit.
     * @param {Map<string, any>} [parameters] - List of values to pass to the recipe
     * @returns {Promise<AnyRecipeData | AnyRecipeCollectionData>} Returns as it is the value returned by the transform method recipe.
     * @throws {RecipeManagerError}
     * @async
     * @public
     */
    run(alias: string, parameters: Map<string, any>): Promise<AnyRecipeData | AnyRecipeCollectionData>;

    /**
     * @description Cleans a designated recipe (by its alias) and the corresponding datasets.
     *    - Step 1. Extract the list of datasets to clean that this recipe uses
     *    - Step 2. Clean the given datasets
     * @param {string} alias - String representation of a recipe -- use one of the RECIPE_*_ALIAS constants available in this unit.
     * @param {Map<string, any>} [parameters] - List of values to pass to the recipe
     * @throws {RecipeManagerError}
     * @public
     */
    clean(alias: string, parameters?: Map<string, any>): void;
}