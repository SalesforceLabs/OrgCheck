import { CodeScanner } from '../core/orgcheck-api-codescanner';
import { DataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { Dataset } from '../core/orgcheck-api-dataset';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { Processor } from '../core/orgcheck-api-processor';
import { SalesforceMetadataTypes } from '../core/orgcheck-api-salesforce-metadatatypes';
import { SalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';
import { SFDC_CollaborationGroup } from '../data/orgcheck-api-data-collaborationgroup';

export class DatasetCollaborationGroups extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @returns {Promise<Map<string, SFDC_CollaborationGroup>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First SOQL query
        logger?.log(`Querying REST API about CollaborationGroup in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            byPasses: ['INVALID_TYPE'], // if Chatter is not enable in the org, CollaborationGroup is not defined!
            string: 'SELECT Id, InformationBody, Description, Name, CreatedDate, LastModifiedDate ' +
                    'FROM CollaborationGroup '
        }], logger);

        // Init the factory and records
        const groupDataFactory = dataFactory.getInstance(SFDC_CollaborationGroup);
        const groupRecords = results[0];

        // Create the map
        logger?.log(`Parsing ${groupRecords.length} chatter groups...`);
        const groups = new Map(await Processor.map(groupRecords, (/** @type {any} */ record) => {

            // Get the ID15
            const id = sfdcManager.caseSafeId(record.Id);

            // Create the instance
            /** @type {SFDC_CollaborationGroup} */
            const group = groupDataFactory.create({
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
                const bodyCode = CodeScanner.RemoveCommentsFromXML(record.InformationBody);
                group.hardCodedURLs = CodeScanner.FindHardCodedURLs(bodyCode);
                group.hardCodedIDs = CodeScanner.FindHardCodedIDs(bodyCode);
            }
            
            // Compute the score of this item
            groupDataFactory.computeScore(group);

            // Add it to the map  
            return [ group.id, group ];
        }));

        // Return data as map
        logger?.log(`Done`);
        return groups;
    } 
}