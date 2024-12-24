// @ts-check

import { OrgCheckDataFactory } from "./orgcheck-api-datafactory";
import { OrgCheckLogger } from "./orgcheck-api-logger";
import { OrgCheckSalesforceManager } from "./orgcheck-api-sfconnectionmanager";

/**
 * @description Base class for all datasets
 */
export class OrgCheckDataset {

    /**
     * @description Run the dataset and return the result
     * @param {OrgCheckSalesforceManager} sfdcManager
     * @param {OrgCheckDataFactory} dataFactory
     * @param {OrgCheckLogger} localLogger
     * @param { ... | undefined } [parameters] List of optional argument to pass
     */
    async run(sfdcManager, dataFactory, localLogger, ...parameters) {
        throw new TypeError('You need to implement the method "run()"');
    }
}