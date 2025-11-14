import { CodeScanner } from '../core/orgcheck-api-codescanner';
import { DataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { Dataset } from '../core/orgcheck-api-dataset';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { Processor } from '../core/orgcheck-api-processor';
import { SalesforceMetadataTypes } from '../core/orgcheck-api-salesforce-metadatatypes';
import { SalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';
import { SFDC_EmailTemplate } from '../data/orgcheck-api-data-emailtemplate';

export class DatasetEmailTemplates extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @returns {Promise<Map<string, SFDC_EmailTemplate>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First SOQL query
        logger?.log(`Querying REST API about EmailTemplates in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            string: 'SELECT Id, Name, ApiVersion, IsActive, HtmlValue, Body, Markup, CreatedDate, ' +
                        'LastModifiedDate, FolderId, FolderName, Description, LastUsedDate, '+
                        'TimesUsed, UiType, TemplateType, NamespacePrefix ' +
                    'FROM EmailTemplate'
        }], logger);
            
        // Init the factories
        const emailTemplateDataFactory = dataFactory.getInstance(SFDC_EmailTemplate);
        const emailTemplateRecords = results[0];
         
        // Create the map
        logger?.log(`Parsing ${emailTemplateRecords.length} email templates...`);
        const emailTemplates = new Map(await Processor.map(emailTemplateRecords, (/** @type {any} */ record) => {
        
            // Get the ID15
            const id = sfdcManager.caseSafeId(record.Id);
            const sourceCode = CodeScanner.RemoveCommentsFromXML(record.HtmlValue || record.Body || record.Markup || '');

            // Create the instance
            /** @type {SFDC_EmailTemplate} */
            const emailTemplate = emailTemplateDataFactory.createWithScore({
                    properties: {
                    id: id,
                    name: record.Name,
                    apiVersion: record.ApiVersion, 
                    isActive: record.IsActive,
                    description: record.Description,
                    package: record.NamespacePrefix || '',
                    hardCodedURLs: CodeScanner.FindHardCodedURLs(sourceCode),
                    hardCodedIDs: CodeScanner.FindHardCodedIDs(sourceCode),
                    createdDate: record.CreatedDate,
                    uiType: record.UiType,
                    type: record.TemplateType,
                    lastModifiedDate: record.LastModifiedDate,
                    lastUsedDate: record.LastUsedDate,
                    timesUsed: record.TimesUsed,
                    folderId: record.FolderId,
                    folderName: record.FolderName,
                    url: sfdcManager.setupUrl(id, SalesforceMetadataTypes.EMAIL_TEMPLATE)
                }
            });

            // Add it to the map
            return [ emailTemplate.id, emailTemplate ];
        }));

        // Return data as map
        logger?.log(`Done`);
        return emailTemplates;
    } 
}