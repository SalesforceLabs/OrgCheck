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
     * @param {SimpleLoggerIntf} logger - Logger
     * @param {Map<string, any>} [parameters] - List of optional argument to pass
     * @returns {Array<string | DatasetRunInformation> | undefined} The datasets aliases that this recipe is using
     * @public
     */
    extract(logger, parameters) { throw new Error(`Method extract(logger=${logger}, parameters=${parameters}) not implemented yet.`); }

    /**
     * @description transform the data from the datasets and return the final result as an Array
     * @param {Map<string, any>} data - Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} logger - Logger
     * @param {Map<string, any>} [parameters] - List of optional argument to pass
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map<string, any>>} Returns as it is the value returned by the transform method recipe.
     * @async
     * @public
     */
    async transform(data, logger, parameters) { throw new Error(`Method transform(data=${data}, logger=${logger}, parameters=${parameters}) not implemented yet.`); }
}