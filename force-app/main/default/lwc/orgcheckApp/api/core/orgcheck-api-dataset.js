import { OrgCheckData, OrgCheckDataWithoutScoring } from "./orgcheck-api-data";
import { OrgCheckDataFactoryIntf } from "./orgcheck-api-datafactory";
import { OrgCheckSimpleLoggerIntf } from "./orgcheck-api-logger";
import { OrgCheckSalesforceManagerIntf } from "./orgcheck-api-salesforcemanager";

/**
 * @description Base class for all datasets
 */
export class OrgCheckDataset {

    /**
     * @description Run the dataset and return the result
     * @param {OrgCheckSalesforceManagerIntf} sfdcManager
     * @param {OrgCheckDataFactoryIntf} dataFactory
     * @param {OrgCheckSimpleLoggerIntf} logger
     * @param { Map | undefined } [parameters] List of optional argument to pass
     * @returns {Promise<Map<string, OrgCheckData | OrgCheckDataWithoutScoring> | OrgCheckData | OrgCheckDataWithoutScoring>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger, parameters) {
        throw new TypeError('You need to implement the method "run()"');
    }
}