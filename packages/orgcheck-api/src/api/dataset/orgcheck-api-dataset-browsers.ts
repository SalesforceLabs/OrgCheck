import { DataAliases } from 'src/api/core/data/orgcheck-api-data-aliases';
import { DataFactoryIntf } from 'src/api/core/data/orgcheck-api-datafactory';
import { Dataset } from 'src/api/core/dataset/orgcheck-api-dataset';
import { SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { MediumProcessor } from 'src/api/core/orgcheck-api-processor';
import { SalesforceManagerIntf } from 'src/api/core/salesforce/orgcheck-api-salesforcemanager';
import { SfdcBrowser } from 'src/api/data/orgcheck-api-data-browser';

export class DatasetBrowsers implements Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @returns {Promise<Map<string, SfdcBrowser>>} The result of the dataset
     */
    async run(sfdcManager: SalesforceManagerIntf, dataFactory: DataFactoryIntf, logger: SimpleLoggerIntf): Promise<Map<string, SfdcBrowser>> {

        // SOQL query
        logger?.log(`Querying REST API about LoginHistory in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            string: 'SELECT Browser, COUNT(Id) CntBrowser ' +
                    'FROM LoginHistory ' +
                    `WHERE LoginType = 'Application' `+
                    'GROUP BY Browser ',
            queryMoreField: 'LoginTime' // aggregate does not support calling QueryMore, use the custom instead
        }], logger);

        // Init the factory and records
        const browserDataFactory = dataFactory.getInstance(DataAliases.SfdcBrowser);

        // Create the map
        const browserRecords = results[0];

        logger?.log(`Parsing ${browserRecords?.length} browsers...`);
        const browsers = new Map();
        await MediumProcessor.forEach(browserRecords, async (record) => {

            if (!record.Browser) return;   // ← guard against null Browser (and undefined)
            const browserElements = (record.Browser as string).split(' ', 2);
            const name = browserElements && browserElements?.length > 0 ? browserElements[0] : record.Browser as string;
            const versionAsText = browserElements && browserElements?.length > 1 ? browserElements[1] : '';
            const version = Number.parseInt(versionAsText, 10) ?? NaN;

            if (browsers.has(name)) {
                const browser: SfdcBrowser = browsers.get(name);
                // Update the number of logins
                browser.nbApplicationLogin += (record.CntBrowser as number);
            } else {
                const browser: SfdcBrowser = browserDataFactory.create({
                    properties: {
                        fullName: record.Browser,
                        name: name,
                        version: version,
                        nbApplicationLogin: record.CntBrowser                 
                    }
                });
                // Add it to the map  
                browsers.set(name, browser);
            }
        });

        // Return data as map
        logger?.log(`Done.`);
        return browsers;
    } 
}