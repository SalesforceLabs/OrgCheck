import { Data } from "./orgcheck-api-data";
import { DataMatrix } from "./orgcheck-api-data-matrix";
import { DatasetRunInformation } from "./orgcheck-api-dataset-runinformation";
import { SimpleLoggerIntf } from "./orgcheck-api-logger";

/**
 * @description The interface for recipes that needs to extract datasets and transform them into an array of items. 
 */
export interface Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfos) that this recipe is using
     * @param {SimpleLoggerIntf} logger - Logger
     * @param {Map<string, any>} [parameters] - List of optional argument to pass
     * @returns {Array<string | DatasetRunInformation>} The datasets aliases that this recipe is using
     * @public
     */
    extract(logger: SimpleLoggerIntf, parameters: Map<string, any>): Array<string | DatasetRunInformation>;

    /**
     * @description transform the data from the datasets and return the final result as an Array
     * @param {Map<string, any>} data - Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} logger - Logger
     * @param {Map<string, any>} [parameters] - List of optional argument to pass
     * @returns {Promise<Array<Data> | DataMatrix | Data | Map<string, any>>} Returns as it is the value returned by the transform method recipe.
     * @async
     * @public
     */
    transform(data: Map<string, any>, logger: SimpleLoggerIntf, parameters: Map<string, any>): Promise<Array<Data> | DataMatrix | Data | Map<string, any>>;
}