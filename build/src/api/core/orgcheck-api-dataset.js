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
     * @param {SalesforceManagerIntf} sfdcManager - The instance of the salesforce manager
     * @param {DataFactoryIntf} dataFactory - The instance of the data factory
     * @param {SimpleLoggerIntf} logger - The instance of the logger
     * @param {Map<string, any> | undefined } [parameters] List of optional argument to pass
     * @returns {Promise<Map<string, Data | DataWithoutScoring> | Data | DataWithoutScoring>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger, parameters) { throw new Error(`Method run(sfdcManager=${sfdcManager}, dataFactory=${dataFactory}, logger=${logger}, parameters=${parameters}) not implemented yet.`); }
}