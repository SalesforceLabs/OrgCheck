import { Data } from 'src/api/core/data/orgcheck-api-data';
import { DataFactoryIntf } from 'src/api/core/data/orgcheck-api-datafactory';
import { SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { SalesforceManagerIntf } from 'src/api/core/salesforce/orgcheck-api-salesforcemanager';
import { ScoreRule } from '../orgcheck-api-data-scorerule';

/**
 * @description Base class for all datasets
 */
export interface Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The instance of the salesforce manager
     * @param {DataFactoryIntf} dataFactory - The instance of the data factory
     * @param {SimpleLoggerIntf | undefined} [logger] - The instance of the logger
     * @param {Map<string, any> | undefined } [parameters] List of optional argument to pass
     * @returns {Promise<Map<string, Data | boolean | ScoreRule> | Data>} The result of the dataset
     * @async
     */
    run(sfdcManager: SalesforceManagerIntf, dataFactory: DataFactoryIntf, logger?: SimpleLoggerIntf | undefined, parameters?: Map<string, unknown> | undefined): Promise<Map<string, Data | boolean | ScoreRule> | Data>;
}