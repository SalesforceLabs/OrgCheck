import { DataFactoryIntf } from 'src/api/core/data/orgcheck-api-datafactory';
import { Dataset } from 'src/api/core/dataset/orgcheck-api-dataset';
import { SecretSauce } from 'src/api/core/orgcheck-api-secretsauce';
import { SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { SalesforceManagerIntf } from 'src/api/core/salesforce/orgcheck-api-salesforcemanager';
import { ScoreRule } from 'src/api/data/orgcheck-api-data-scorerule';

export class DatasetScoreRules implements Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} _sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} _dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Promise<Map<string, ScoreRule>>} The result of the dataset
     */
    public async run(_sfdcManager: SalesforceManagerIntf, _dataFactory: DataFactoryIntf, _logger: SimpleLoggerIntf): Promise<Map<string, ScoreRule>> {

        // Return data
        return new Map(SecretSauce.AllScoreRules.map((rule) => [ `${rule.id}`, rule ]));
    } 
}