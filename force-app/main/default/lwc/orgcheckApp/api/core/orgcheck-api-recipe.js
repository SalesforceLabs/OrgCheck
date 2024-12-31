import { OrgCheckData, OrgCheckDataWithoutScoring } from "./orgcheck-api-data";
import { OrgCheckDataMatrix } from "./orgcheck-api-data-matrix";
import { OrgCheckDatasetRunInformation } from "./orgcheck-api-dataset-runinformation";
import { OrgCheckSimpleLoggerIntf } from "./orgcheck-api-logger";

/**
 * @description The super class for all recipes. 
 */
export class OrgCheckRecipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {OrgCheckSimpleLoggerIntf} logger
     * @param { ... | undefined } [parameters] List of optional argument to pass
     * @returns {Array<string | OrgCheckDatasetRunInformation>}
     * @public
     */
    extract(logger, ...parameters) {
        throw new TypeError(`You need to implement the method "extract()"`);
    }

    /**
     * @description transform the data from the datasets and return the final result as an Array
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {OrgCheckSimpleLoggerIntf} logger
     * @param { ... | undefined } [parameters] List of optional argument to pass
     * @returns {Promise<Array<OrgCheckData | OrgCheckDataWithoutScoring> | OrgCheckDataMatrix | OrgCheckData | OrgCheckDataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger, ...parameters) {
        throw new TypeError(`You need to implement the method "transform()"`);
    }
}