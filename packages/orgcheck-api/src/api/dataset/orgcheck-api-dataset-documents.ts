import { CodeScanner } from 'src/api/core/orgcheck-api-codescanner';
import { DataAliases } from 'src/api/core/orgcheck-api-data-aliases';
import { DataFactoryIntf } from 'src/api/core/orgcheck-api-datafactory';
import { Dataset } from 'src/api/core/orgcheck-api-dataset';
import { SimpleLoggerIntf } from 'src/api/core/orgcheck-api-logger';
import { Processor } from 'src/api/core/orgcheck-api-processor';
import { SalesforceMetadataTypes } from 'src/api/core/orgcheck-api-salesforce-metadatatypes';
import { SalesforceManagerIntf } from 'src/api/core/orgcheck-api-salesforcemanager';
import { SfdcDocument } from 'src/api/data/orgcheck-api-data-document';

export class DatasetDocuments implements Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @returns {Promise<Map<string, SfdcDocument>>} The result of the dataset
     */
    async run(sfdcManager: SalesforceManagerIntf, dataFactory: DataFactoryIntf, logger: SimpleLoggerIntf): Promise<Map<string, SfdcDocument>> {

        // First SOQL query
        logger?.log(`Querying REST API about Document in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            string: 'SELECT Id, Name, Url, BodyLength, ContentType, CreatedDate, Description, ' +
                        'DeveloperName, Folder.Name, Folder.Id, LastModifiedDate, NamespacePrefix ' +
                    'FROM Document '
        }], logger);

        // Init the factory and records
        const documentDataFactory = dataFactory.getInstance(DataAliases.SfdcDocument);
        const documentRecords = results[0];

        // Create the map
        logger?.log(`Parsing ${documentRecords?.length} documents...`);
        const documents: Map<string, SfdcDocument> = new Map(await Processor.map(documentRecords, (/** @type {any} */ record: any) => {

            // Get the ID15 of this custom label
            const id = sfdcManager.caseSafeId(record.Id);

            // Create the instance
            /** @type {SfdcDocument} */
            const document: SfdcDocument = documentDataFactory.createWithScore({
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