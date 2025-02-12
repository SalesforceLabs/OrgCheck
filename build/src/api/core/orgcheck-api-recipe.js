import { Data, DataWithoutScoring } from "./orgcheck-api-data";
import { DataMatrix } from "./orgcheck-api-data-matrix";
import { DatasetRunInformation } from "./orgcheck-api-dataset-runinformation";
import { SimpleLoggerIntf } from "./orgcheck-api-logger";

/**
 * @description The super class for all recipes. 
 */
export class Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {SimpleLoggerIntf} logger
     * @param { ... | undefined } [parameters] List of optional argument to pass
     * @returns {Array<string | DatasetRunInformation>}
     * @public
     */
    extract(logger, ...parameters) {
        throw new TypeError(`You need to implement the method "extract()"`);
    }

    /**
     * @description transform the data from the datasets and return the final result as an Array
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} logger
     * @param { ... | undefined } [parameters] List of optional argument to pass
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger, ...parameters) {
        throw new TypeError(`You need to implement the method "transform()"`);
    }
}