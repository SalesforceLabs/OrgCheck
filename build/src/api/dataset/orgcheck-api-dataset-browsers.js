import { DataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { Dataset } from '../core/orgcheck-api-dataset';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { Processor } from '../core/orgcheck-api-processor';
import { SalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';
import { SFDC_Browser } from '../data/orgcheck-api-data-browser';

export class DatasetBrowsers extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @returns {Promise<Map<string, SFDC_Browser>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

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
        const browserDataFactory = dataFactory.getInstance(SFDC_Browser);

        // Create the map
        const browserRecords = results[0];

        logger?.log(`Parsing ${browserRecords.length} browsers...`);
        const browsers = new Map();
        await Processor.forEach(browserRecords, (/** @type {any} */ record) => {

            const browserElements = record.Browser.split(' ', 2);
            const name = browserElements && browserElements.length > 0 ? browserElements[0] : record.Browser;
            const versionAsText = browserElements && browserElements.length > 1 ? browserElements[1] : '';
            const version = Number.parseInt(versionAsText, 10) ?? NaN;

            if (browsers.has(name)) {
                /** @type {SFDC_Browser} */
                const browser = browsers.get(name);
                // Update the number of logins
                browser.nbApplicationLogin += record.CntBrowser;
            } else {
                /** @type {SFDC_Browser} */
                const browser = browserDataFactory.create({
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
        logger?.log(`Done`);
        return browsers;
    } 
}