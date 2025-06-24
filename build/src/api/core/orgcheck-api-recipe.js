import { Data, DataWithoutScoring } from "./orgcheck-api-data";
import { DataMatrix } from "./orgcheck-api-data-matrix";
import { DatasetRunInformation } from "./orgcheck-api-dataset-runinformation";
import { SimpleLoggerIntf } from "./orgcheck-api-logger";

/**
 * @description The super class for recipes that needs to extract datasets and transform them into an array of items. 
 */
export class Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfos) that this recipe is using
     * @param {SimpleLoggerIntf} logger
     * @param {Map | undefined} [parameters] List of optional argument to pass
     * @returns {Array<string | DatasetRunInformation>}
     * @public
     */
    extract(logger, parameters) {
        throw new TypeError(`You need to implement the method "extract()"`);
    }

    /**
     * @description transform the data from the datasets and return the final result as an Array
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} logger
     * @param {Map | undefined} [parameters] List of optional argument to pass
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger, parameters) {
        throw new TypeError(`You need to implement the method "transform()"`);
    }
}

/**
 * @description The super class for recipe collections that are defined only by executing a set of other recipes
 */
export class RecipeCollection {

    /**
     * @description List all recipe aliases that this recipe collection needs
     * @param {SimpleLoggerIntf} logger
     * @param {Map | undefined} [parameters] List of optional argument to pass
     * @returns {Array<string>}
     * @public
     */
    extract(logger, parameters) {
        throw new TypeError(`You need to implement the method "extract()"`);
    }

    /**
     * @description transform the data from the recipes and return the final result as a Map
     * @param {Map<string, Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map>} data Records or information grouped by recipes (given by their alias) in a Map
     * @param {SimpleLoggerIntf} logger
     * @param {Map | undefined} [parameters] List of optional argument to pass
     * @returns {Promise<Map>}
     * @async
     * @public
     */
    async transform(data, logger, parameters) {
        throw new TypeError(`You need to implement the method "transform()"`);
    }
}