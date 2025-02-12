import { Data, DataWithoutScoring } from "./orgcheck-api-data";
import { DataFactoryIntf } from "./orgcheck-api-datafactory";
import { SimpleLoggerIntf } from "./orgcheck-api-logger";
import { SalesforceManagerIntf } from "./orgcheck-api-salesforcemanager";

/**
 * @description Base class for all datasets
 */
export class Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager
     * @param {DataFactoryIntf} dataFactory
     * @param {SimpleLoggerIntf} logger
     * @param { Map | undefined } [parameters] List of optional argument to pass
     * @returns {Promise<Map<string, Data | DataWithoutScoring> | Data | DataWithoutScoring>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger, parameters) {
        throw new TypeError('You need to implement the method "run()"');
    }
}