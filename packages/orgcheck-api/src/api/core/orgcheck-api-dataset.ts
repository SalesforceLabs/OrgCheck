import { Data, DataWithoutScoring } from "./orgcheck-api-data";
import { DataFactoryIntf } from "./orgcheck-api-datafactory";
import { SimpleLoggerIntf } from "./orgcheck-api-logger";
import { SalesforceManagerIntf } from "./orgcheck-api-salesforcemanager";

/**
 * @description Base class for all datasets
 */
export interface Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The instance of the salesforce manager
     * @param {DataFactoryIntf} dataFactory - The instance of the data factory
     * @param {SimpleLoggerIntf} logger - The instance of the logger
     * @param {Map<string, any> | undefined } [parameters] List of optional argument to pass
     * @returns {Promise<Map<string, Data | DataWithoutScoring> | Data | DataWithoutScoring>} The result of the dataset
     * @async
     */
    run(sfdcManager: SalesforceManagerIntf, dataFactory: DataFactoryIntf, logger: SimpleLoggerIntf, parameters?: Map<string, any>): Promise<Map<string, Data | DataWithoutScoring> | Data | DataWithoutScoring>;
}