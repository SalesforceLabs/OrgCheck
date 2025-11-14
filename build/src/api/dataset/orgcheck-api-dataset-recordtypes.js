import { DataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { Dataset } from '../core/orgcheck-api-dataset';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { Processor } from '../core/orgcheck-api-processor';
import { SalesforceMetadataTypes } from '../core/orgcheck-api-salesforce-metadatatypes';
import { SalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';
import { SFDC_RecordType } from '../data/orgcheck-api-data-recordtype';

export class DatasetRecordTypes extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - List of optional argument to pass
     * @returns {Promise<Map<string, SFDC_RecordType>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First SOQL queries
        logger?.log(`Querying REST API about Record Types and Profiles in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            string: 'SELECT DeveloperName, NamespacePrefix, Id, Name, SobjectType, IsActive ' +
                    'FROM RecordType '
        }, {
            string: 'SELECT Id FROM Profile '
        }], logger);

        const recordTypeDataFactory = dataFactory.getInstance(SFDC_RecordType);
        const recordTypeRecords = results[0];
        const profileRecords = results[1];

        logger?.log(`Parsing ${recordTypeRecords.length} record types...`);
        const recordTypeDevNameToId = new Map();
        const recordTypes = new Map(await Processor.map(recordTypeRecords, async (/** @type {any} */ record) => {
        
            // Get the ID15 of this record type
            const id = sfdcManager.caseSafeId(record.Id);

            // Create the instance
            /** @type {SFDC_RecordType} */
            const recordType = recordTypeDataFactory.create({
                properties: {
                    id: sfdcManager.caseSafeId(id), 
                    name: record.Name, 
                    developerName: record.DeveloperName,
                    package: (record.NamespacePrefix || ''),
                    url: sfdcManager.setupUrl(id, SalesforceMetadataTypes.RECORD_TYPE, record.SobjectType),
                    isActive: record.IsActive,
                    objectId: record.SobjectType,
                    isAvailable: false, // as a start value may change when we check the profiles
                    isDefault: false, // as a start value may change when we check the profiles
                }
            });

            // Add the reference for later use
            recordTypeDevNameToId.set(`${record.SobjectType}.${record.NamespacePrefix ? (record.NamespacePrefix+'__') : ''}${record.DeveloperName}`, id);

            // Add it to the map  
            return [ recordType.id, recordType ];
        }));

        logger?.log(`Extracting Ids from ${profileRecords.length} profiles...`);
        const profileIds = await Processor.map(profileRecords, (/** @type {any} */ record) => sfdcManager.caseSafeId(record.Id));

        logger?.log(`Get record type information from Profile Metatdata API`);
        const profiles = await sfdcManager.readMetadataAtScale('Profile', profileIds, [], logger);

        logger?.log(`Parsing ${profiles.length} profiles looking for record types information...`);
        await Processor.forEach(profiles, (/** @type {any} */ profile) => {
            profile.Metadata?.recordTypeVisibilities?.forEach((/** @type {any} */ rtv) => {
                if (recordTypeDevNameToId.has(rtv.recordType)) {
                    const id = recordTypeDevNameToId.get(rtv.recordType);
                    if (recordTypes.has(id)) {
                        const recordType = recordTypes.get(id);
                        if (recordType.isDefault === false && rtv.default === true) {
                            recordType.isDefault = true;
                        }
                        if (recordType.isAvailable === false && rtv.visible === true) {
                            recordType.isAvailable = true;
                        }
                    }
                }
            });
        });

        // Then compute the score of record types 
        await Processor.forEach(recordTypes, (/** @type {SFDC_RecordType} */ recordType) => {
            recordTypeDataFactory.computeScore(recordType);
        });

        // Return data as map
        logger?.log(`Done`);
        return recordTypes;
    } 
}