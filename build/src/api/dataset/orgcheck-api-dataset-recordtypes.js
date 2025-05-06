import { DataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { Dataset } from '../core/orgcheck-api-dataset';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { Processor } from '../core/orgcheck-api-processing';
import { SalesforceMetadataTypes } from '../core/orgcheck-api-salesforce-metadatatypes';
import { SalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';
import { SFDC_RecordType } from '../data/orgcheck-api-data-recordtype';

export class DatasetRecordTypes extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager
     * @param {DataFactoryIntf} dataFactory
     * @param {SimpleLoggerIntf} logger List of optional argument to pass
     * @returns {Promise<Map<string, SFDC_RecordType>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First SOQL query
        logger?.log(`Querying Tooling API about Record Types in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            string: 'SELECT DeveloperName, Id, Name, SobjectType ' +
                    'FROM RecordType ' +
                    'Where IsActive = true ' +
                    'AND (NamespacePrefix = \'\' OR NamespacePrefix = \'' + '<org_Prefix>' + '\')',
            tooling: true
        }], logger);

        const recordTypeDataFactory = dataFactory.getInstance(SFDC_RecordType);

        const recordTypeRecords = results[0];
        logger?.log(`Parsing ${recordTypeRecords.length} record type...`);
        const recordTypes = new Map(await Processor.map(recordTypeRecords, async (record) => {
        
            // Get the ID15 of this record type
            const id = sfdcManager.caseSafeId(record.Id);

            // Create the instance
            const recordType = recordTypeDataFactory.createWithScore({
                properties: {
                    //DevelopperName
                    name: record.DeveloperName,
                    id: sfdcManager.caseSafeId(id), 
                    //name: record.RecordType, 
                    isActive: record.Active,
                    //sObjectType
                    package: (record.NamespacePrefix || ''),
                    //description: record.Description,
                    errorDisplayField: record.ErrorDisplayField,
                    errorMessage: record.ErrorMessage,
                    objectId: record.EntityDefinition?.QualifiedApiName,
                    //createdDate: record.CreatedDate,
                    //lastModifiedDate: record.LastModifiedDate, 
                    url: sfdcManager.setupUrl(id, SalesforceMetadataTypes.RECORD_TYPE)
                }
            });

            // Add it to the map  
            return [ recordType.id, recordType ];
        }));

        // Return data as map
        logger?.log(`Done`);
        return recordTypes;
    } 
}