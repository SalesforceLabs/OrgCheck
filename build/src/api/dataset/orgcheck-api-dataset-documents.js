import { CodeScanner } from '../core/orgcheck-api-codescanner';
import { DataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { Dataset } from '../core/orgcheck-api-dataset';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { Processor } from '../core/orgcheck-api-processor';
import { SalesforceMetadataTypes } from '../core/orgcheck-api-salesforce-metadatatypes';
import { SalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';
import { SFDC_Document } from '../data/orgcheck-api-data-document';

export class DatasetDocuments extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @returns {Promise<Map<string, SFDC_Document>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First SOQL query
        logger?.log(`Querying REST API about Document in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            string: 'SELECT Id, Name, Url, BodyLength, ContentType, CreatedDate, Description, ' +
                        'DeveloperName, Folder.Name, Folder.Id, LastModifiedDate, NamespacePrefix ' +
                    'FROM Document '
        }], logger);

        // Init the factory and records
        const documentDataFactory = dataFactory.getInstance(SFDC_Document);
        const documentRecords = results[0];

        // Create the map
        logger?.log(`Parsing ${documentRecords.length} documents...`);
        const documents = new Map(await Processor.map(documentRecords, (/** @type {any} */ record) => {

            // Get the ID15 of this custom label
            const id = sfdcManager.caseSafeId(record.Id);

            // Create the instance
            /** @type {SFDC_Document} */
            const document = documentDataFactory.createWithScore({
                properties: {
                    id: id,
                    name: record.Name,
                    documentUrl: record.Url,
                    isHardCodedURL: CodeScanner.FindHardCodedURLs(record.Url)?.length > 0 || false,
                    size: record.BodyLength,
                    type: record.ContentType,
                    description: record.Description,
                    createdDate: record.CreatedDate,
                    lastModifiedDate: record.LastModifiedDate,
                    folderId: record.Folder?.Id,
                    folderName: record.Folder?.Name,
                    package: (record.NamespacePrefix || ''),
                    url: sfdcManager.setupUrl(id, SalesforceMetadataTypes.DOCUMENT)
                }
            });

            // Add it to the map  
            return [ document.id, document ];
        }));

        // Return data as map
        logger?.log(`Done`);
        return documents;
    } 
}