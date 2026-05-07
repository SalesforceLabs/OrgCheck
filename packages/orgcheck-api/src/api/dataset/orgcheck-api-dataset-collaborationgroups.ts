import { CodeScanner } from 'src/api/core/orgcheck-api-codescanner';
import { DataAliases } from 'src/api/core/data/orgcheck-api-data-aliases';
import { DataFactoryIntf } from 'src/api/core/data/orgcheck-api-datafactory';
import { Dataset } from 'src/api/core/dataset/orgcheck-api-dataset';
import { SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { MediumProcessor } from 'src/api/core/orgcheck-api-processor';
import { SalesforceMetadataTypes } from 'src/api/core/salesforce/orgcheck-api-salesforce-metadatatypes';
import { SalesforceManagerIntf } from 'src/api/core/salesforce/orgcheck-api-salesforcemanager';
import { SfdcCollaborationGroup } from 'src/api/data/orgcheck-api-data-collaborationgroup';

export class DatasetCollaborationGroups implements Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @returns {Promise<Map<string, SfdcCollaborationGroup>>} The result of the dataset
     */
    async run(sfdcManager: SalesforceManagerIntf, dataFactory: DataFactoryIntf, logger: SimpleLoggerIntf): Promise<Map<string, SfdcCollaborationGroup>> {

        // First SOQL query
        logger?.log(`Querying REST API about CollaborationGroup in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            byPasses: ['INVALID_TYPE'], // if Chatter is not enable in the org, CollaborationGroup is not defined!
            string: 'SELECT Id, InformationBody, Description, Name, CreatedDate, LastModifiedDate ' +
                    'FROM CollaborationGroup '
        }], logger);

        // Init the factory and records
        const groupDataFactory = dataFactory.getInstance(DataAliases.SfdcCollaborationGroup);
        const groupRecords = results[0];

        // Create the map
        logger?.log(`Parsing ${groupRecords?.length} chatter groups...`);
        const groups: Map<string, SfdcCollaborationGroup> = new Map(await MediumProcessor.map(groupRecords, (record) => {

            // Get the ID15
            const id = sfdcManager.caseSafeId(record.Id as string);

            // Create the instance
            const group: SfdcCollaborationGroup = groupDataFactory.create({
                properties: {
                    id: id,
                    name: record.Name,
                    createdDate: record.CreatedDate,
                    lastModifiedDate: record.LastModifiedDate,
                    description: record.Description,
                    url: sfdcManager.setupUrl(id, SalesforceMetadataTypes.COLLABORATION_GROUP),
                }
            });

            // Get information directly from the source code (if available)
            if (record.InformationBody) {
                const bodyCode = CodeScanner.RemoveCommentsFromXML(record.InformationBody as string);
                group.hardCodedURLs = CodeScanner.FindHardCodedURLs(bodyCode);
                group.hardCodedIDs = CodeScanner.FindHardCodedIDs(bodyCode);
            }
            
            // Compute the score of this item
            groupDataFactory.computeScore(group);

            // Add it to the map  
            return [ group.id, group ];
        }));

        // Return data as map
        logger?.log(`Done.`);
        return groups;
    } 
}