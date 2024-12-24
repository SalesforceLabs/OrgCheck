// @ts-check

import { OrgCheckData } from "./orgcheck-api-data";
import { OrgCheckMatrixData } from "./orgcheck-api-data-matrix";
import { OrgCheckDatasetRunInformation } from "./orgcheck-api-datasetmanager";

/**
 * @description The super class for all recipes. 
 */
export class OrgCheckRecipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param { ... | undefined } [parameters] List of optional argument to pass
     * @returns {Array<string | OrgCheckDatasetRunInformation>}
     * @public
     */
    extract(...parameters) {
        throw new TypeError(`You need to implement the method "extract()"`);
    }

    /**
     * @description transform the data from the datasets and return the final result as an Array
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param { ... | undefined } [parameters] List of optional argument to pass
     * @returns {Promise<Array<OrgCheckData> | OrgCheckMatrixData | OrgCheckData | Map>}
     * @async
     * @public
     */
    async transform(data, ...parameters) {
        throw new TypeError(`You need to implement the method "transform()"`);
    }
}