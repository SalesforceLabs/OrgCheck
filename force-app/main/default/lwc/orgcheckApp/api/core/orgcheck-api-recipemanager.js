import { OrgCheckData, OrgCheckDataWithoutScoring } from "./orgcheck-api-data";
import { OrgCheckDataMatrix } from "./orgcheck-api-data-matrix";

/**
 * @description Recipe Manager interface
 */ 
export class OrgCheckRecipeManagerIntf {

    /**
     * @description Runs a designated recipe (by its alias)
     *   - Step 1. Extract the list of datasets to run that this recipe uses
     *   - Step 2. Run the given datasets and gather the global data retrieved
     *   - Step 3. Transform the retrieved data and return the final result as a Map
     * @param {string} alias String representation of a recipe -- use one of the RECIPE_*_ALIAS constants available in this unit.
     * @param {Array<string|object>} parameters List of values to pass to the exract and tranform methods of the recipe.
     * @returns {Promise<Array<OrgCheckData | OrgCheckDataWithoutScoring> | OrgCheckDataMatrix | OrgCheckData | OrgCheckDataWithoutScoring | Map>} Returns as it is the value returned by the transform method recipe.
     * @async
     * @public
     */
    async run(alias, ...parameters) { throw new TypeError(`You need to implement the method "run()"`); }

    /**
     * @description Cleans a designated recipe (by its alias) and the corresponding datasets.
     *    - Step 1. Extract the list of datasets to clean that this recipe uses
     *    - Step 2. Clean the given datasets
     * @param {string} alias String representation of a recipe -- use one of the RECIPE_*_ALIAS constants available in this unit.
     * @param {Array<string|object>} [parameters] List of values to pass to the exract method of the recipe.
     * @public
     */
    clean(alias, ...parameters) { throw new TypeError(`You need to implement the method "clean()"`); }
}