import { DatasetRunInformation } from 'src/api/core/dataset/orgcheck-api-dataset-runinformation';
import { SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { ExportedTable } from 'src/ui/table/orgcheck-ui-table';

/**
 * @description The Recipe interface represents how Org Check will:
 *                  - get a list of ingredients (aka Datasets), 
 *                  - mix the ingredients all together (logical view of the data)
 */
export interface Recipe<T> {

    /**
     * @description Title of this recipe
     * @type {string}
     * @public
     */
    title: string;

    /**
     * @description List all ingredients (aka dataset aliases or datasetRunInfos) that Org Check will use in this recipe
     * @param {SimpleLoggerIntf | undefined} logger - Logger
     * @param {Map<string, any>} [parameters] - List of optional argument to pass
     * @returns {Array<string | DatasetRunInformation>} The ingredients to use in this recipe
     * @public
     */
    ingredients(logger: SimpleLoggerIntf | undefined, parameters: Map<string, unknown>): Array<string | DatasetRunInformation>;

    /**
     * @description mix the ingredients all together and return the result
     * @param {Map<string, any>} ingredients - Records or information grouped by their alias in a Map
     * @param {SimpleLoggerIntf | undefined} logger - Logger
     * @param {Map<string, any>} [parameters] - List of optional argument to pass
     * @returns {Promise<T>} Returns the mixture
     * @async
     * @public
     */
    mix(ingredients: Map<string, unknown>, logger: SimpleLoggerIntf | undefined, parameters: Map<string, unknown>): Promise<T>;

    /**
     * @description List the parameters that this mix depends on on
     * @returns {string[]} List of parameters that this mix dependes on
     * @public
     */
    mixDependencies(): string[];
}

/**
 * @description The ServedRecipe interface represents a Recipe that Org Check can:
 *                  - serve to the table (use as a table view in the UI)
 *                  - serve to go (use as an exported table view to generate XLSX etc.).
 */
export interface ServedRecipe<Mixture, Plate> extends Recipe<Mixture> {

    /**
     * @description Process the mixed data into a table format
     * @param {Mixture} mixture - Mixed data to be served to a table
     * @param {SimpleLoggerIntf} [simpleLogger] - Simple logger for this task (optional)
     * @returns {Promise<Plate>} The processed view
     * @async
     * @public
     */
    serveToTable(mixture: Mixture, simpleLogger?: SimpleLoggerIntf): Promise<Plate>;

    /**
     * @description We put your plate in a doggy bag
     * @param {Plate} plate - Plate which was on the table
     * @param {SimpleLoggerIntf} [simpleLogger] - Simple logger for this task (optional)
     * @returns {Promise<ExportedTable | ExportedTable[]>} Meal in a doggy bag, ready to take back home!
     * @async
     * @public
     */
    serveToGo(plate: Plate): Promise<ExportedTable | ExportedTable[]>;
}
