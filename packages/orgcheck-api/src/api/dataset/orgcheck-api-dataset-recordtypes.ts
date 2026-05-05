import { DataAliases } from 'src/api/core/data/orgcheck-api-data-aliases';
import { DataFactoryIntf } from 'src/api/core/data/orgcheck-api-datafactory';
import { Dataset } from 'src/api/core/dataset/orgcheck-api-dataset';
import { SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { MediumProcessor } from 'src/api/core/orgcheck-api-processor';
import { SalesforceMetadataTypes } from 'src/api/core/salesforce/orgcheck-api-salesforce-metadatatypes';
import { SalesforceManagerIntf } from 'src/api/core/salesforce/orgcheck-api-salesforcemanager';
import { SfdcRecordType } from 'src/api/data/orgcheck-api-data-recordtype';

export class DatasetRecordTypes implements Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - List of optional argument to pass
     * @returns {Promise<Map<string, SfdcRecordType>>} The result of the dataset
     */
    async run(sfdcManager: SalesforceManagerIntf, dataFactory: DataFactoryIntf, logger: SimpleLoggerIntf): Promise<Map<string, SfdcRecordType>> {

        // First SOQL queries
        logger?.log(`Querying REST API about Record Types and Profiles in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            string: 'SELECT DeveloperName, NamespacePrefix, Id, Name, SobjectType, IsActive ' +
                    'FROM RecordType '
        }, {
            string: 'SELECT Id FROM Profile '
        }], logger);

        const recordTypeDataFactory = dataFactory.getInstance(DataAliases.SfdcRecordType);
        const recordTypeRecords = results[0];
        const profileRecords = results[1];

        logger?.log(`Parsing ${recordTypeRecords?.length} record types...`);
        const recordTypeDevNameToId = new Map();
        const recordTypes: Map<string, SfdcRecordType> = new Map(await MediumProcessor.map(recordTypeRecords, async (record: any) => {
        
            // Get the ID15 of this record type
            const id = sfdcManager.caseSafeId(record.Id);

            // Create the instance
            const recordType: SfdcRecordType = recordTypeDataFactory.create({
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

        logger?.log(`Extracting Ids from ${profileRecords?.length} profiles...`);
        const profileIds = await MediumProcessor.map(profileRecords, (record: any) => sfdcManager.caseSafeId(record.Id));

        logger?.log(`Getting record type information from Profile Metadata API...`);
        const profiles = await sfdcManager.readMetadataAtScale('Profile', profileIds, [], logger);

        logger?.log(`Parsing ${profiles?.length} profiles looking for record types information...`);
        await MediumProcessor.forEach(profiles, async (profile: any) => {
            profile.Metadata?.recordTypeVisibilities?.forEach((rtv: any) => {
                if (recordTypeDevNameToId.has(rtv.recordType)) {
                    const id = recordTypeDevNameToId.get(rtv.recordType);
                    const recordType = recordTypes.get(id);
                    if (recordType) {
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
        await MediumProcessor.forEach(recordTypes, async (recordType: SfdcRecordType) => {
            recordTypeDataFactory.computeScore(recordType);
        });

        // Return data as map
        logger?.log(`Done.`);
        return recordTypes;
    } 
}