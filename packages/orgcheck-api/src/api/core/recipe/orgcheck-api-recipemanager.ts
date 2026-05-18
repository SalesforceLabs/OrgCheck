import { DataWithScore } from 'src/api/core/data/orgcheck-api-data';
import { DataMatrixIntf } from 'src/api/core/data/orgcheck-api-data-matrix';
import { DataCollectionStatisticsIntf } from 'src/api/core/data/orgcheck-api-data-datacollectionstats';
import { SfdcObjectAsTable } from 'src/api/recipe/orgcheck-api-recipe-object';
import { ExportedTable, Table } from 'src/ui/table/orgcheck-ui-table';
import { RecipeAliases } from 'src/api/core/recipe/orgcheck-api-recipes-aliases';
import { GlobalViewAsTable } from 'src/api/recipecollection/orgcheck-api-recipe-globalview';
import { SimpleLoggerIntf } from '../logger/orgcheck-api-logger';

/**
 * @description Recipe Manager interface
 */ 
export interface RecipeManagerIntf {

    /**
     * @description Prepare a designated recipe (by its alias)
     *   - Step 1. Extract the list of datasets to run that this recipe uses
     *   - Step 2. Run the given datasets and gather the global data retrieved
     *   - Step 3. Combine/mix all the data together
     *   - Step 4. Return the mixture
     * @param {string} alias - String representation of a recipe -- use one of the RECIPE_*_ALIAS constants available in this unit.
     * @param {Map<string, any>} parameters - List of values to pass to the recipe
     * @param {SimpleLoggerIntf} [logger] - Simple logger for this task (optional)
     * @returns {Promise<DataWithScore | DataWithScore[] | DataMatrixIntf | Map<string, boolean>| DataCollectionStatisticsIntf[]>} Returns the mixture
     * @throws {TypeError}
     * @async
     * @public
     */
    prepare(alias: RecipeAliases, parameters: Map<string, unknown>, logger?: SimpleLoggerIntf): Promise<DataWithScore | DataWithScore[] | DataMatrixIntf | Map<string, boolean> | DataCollectionStatisticsIntf[]>;

    /**
     * @description Serve the mixture from a designated recipe to a table
     * @param {string} alias - String representation of a recipe
     * @param {DataWithScore | DataWithScore[] | DataMatrixIntf | Map<string, boolean> | DataCollectionStatisticsIntf[]} [mixture] - The mixture
     * @param {SimpleLoggerIntf} [logger] - Simple logger for this task (optional)
     * @returns {Promise<Table | SfdcObjectAsTable | GlobalViewAsTable | Table[]>} Returns the mixture as a table
     * @throws {TypeError}
     * @async
     * @public
     */
    serveToTable(alias: RecipeAliases, mixture: DataWithScore | DataWithScore[] | DataMatrixIntf | Map<string, boolean> | DataCollectionStatisticsIntf[], logger?: SimpleLoggerIntf): Promise<Table | SfdcObjectAsTable | GlobalViewAsTable | Table[]>;

    /**
     * @description Serve the mixture from a designated recipe to go
     * @param {string} alias - String representation of a recipe
     * @param {Table | SfdcObjectAsTable | GlobalViewAsTable | Table[]} plate - The plate to serve to go
     * @param {SimpleLoggerIntf} [logger] - Simple logger for this task (optional)
     * @returns {Promise<ExportedTable | ExportedTable[]>} Returns the mixture as to go
     * @throws {TypeError}
     * @async
     * @public
     */
    serveToGo(alias: RecipeAliases, plate: Table | SfdcObjectAsTable | GlobalViewAsTable | Table[], logger?: SimpleLoggerIntf): Promise<ExportedTable | ExportedTable[]>;

    /**
     * @description Returns the cache stamp for a designated recipe (by its alias)
     * @param {string} alias - String representation of a recipe
     * @param {Map<string, any>} [parameters] - List of values to pass to the recipe
     * @returns {Promise<string>} Returns the cache stamp
     * @public
     */
    cachestamp(alias: RecipeAliases, parameters: Map<string, unknown>): string;

    /**
     * @description Cleans a designated recipe (by its alias) and the corresponding datasets.
     *    - Step 1. Extract the list of datasets to clean that this recipe uses
     *    - Step 2. Clean the given datasets
     * @param {string} alias - String representation of a recipe -- use one of the RECIPE_*_ALIAS constants available in this unit.
     * @param {Map<string, any>} [parameters] - List of values to pass to the recipe
     * @throws {TypeError}
     * @public
     */
    clean(alias: string, parameters?: Map<string, unknown>): void;

    /**
     * @description List all available recipe titles
     * @returns {Map<RecipeAliases, string>} Returns the map of all available recipe titles
     * @public
     */
    listAllTitles(): Map<RecipeAliases, string>;
}