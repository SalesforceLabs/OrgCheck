import { DataAliases } from 'src/api/core/data/orgcheck-api-data-aliases';
import { DataFactoryIntf } from 'src/api/core/data/orgcheck-api-datafactory';
import { Dataset } from 'src/api/core/dataset/orgcheck-api-dataset';
import { SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { MediumProcessor } from 'src/api/core/orgcheck-api-processor';
import { SalesforceManagerIntf } from 'src/api/core/salesforce/orgcheck-api-salesforcemanager';
import { SfdcProfileRestrictions } from 'src/api/data/orgcheck-api-data-profilerestrictions';

const COMPUTE_NUMBER_FROM_IP = (ip: string) => {
    return ip?.split('.').reduce((prev, currentItem, currentIndex, array) => { 
        return prev + Number(currentItem) * Math.pow(255, array?.length-1-currentIndex); 
    }, 0);
}

const WEEKDAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

export class DatasetProfileRestrictions implements Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @returns {Promise<Map<string, SfdcProfileRestrictions>>} The result of the dataset
     */
    async run(sfdcManager: SalesforceManagerIntf, dataFactory: DataFactoryIntf, logger: SimpleLoggerIntf): Promise<Map<string, SfdcProfileRestrictions>> {

        // First SOQL query
        // (only ids because metadata can't be read via SOQL in bulk!
        logger?.log(`Querying REST API about Profile in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            string: 'SELECT Id FROM Profile'
        }], logger);
            
        // List of profile ids
        const profileIdRecords = results[0];
        logger?.log(`Parsing ${profileIdRecords?.length} profiles...`);
        const profileIds = await MediumProcessor.map(profileIdRecords, (record: any) => record.Id);

        // Init the factories
        const restrictionsFactory = dataFactory.getInstance(DataAliases.SfdcProfileRestrictions);
        const ipRangeDataFactory = dataFactory.getInstance(DataAliases.SfdcProfileIpRangeRestriction);
        const loginHourDataFactory = dataFactory.getInstance(DataAliases.SfdcProfileLoginHourRestriction);

        // Get information about profiles using metadata
        logger?.log(`Calling Tooling API Composite to get more information about these ${profileIds?.length} profiles...`);
        const records = await sfdcManager.readMetadataAtScale('Profile', profileIds, [ 'UNKNOWN_EXCEPTION' ], logger);

        // Create the map
        logger?.log(`Parsing ${records?.length} profile restrictions...`);
        const profileRestrictions: Map<string, SfdcProfileRestrictions> = new Map(await MediumProcessor.map(records, async (record: any) => {

            // Get the ID15 of this profile
            const profileId = sfdcManager.caseSafeId(record.Id);

            // Login Hours
            let loginHours;
            if (record.Metadata.loginHours) {
                loginHours = await MediumProcessor.map(
                    WEEKDAYS,
                    (day: string) => {
                        const hourStart = record.Metadata.loginHours[day + 'Start'];
                        const hourEnd = record.Metadata.loginHours[day + 'End'];
                        return loginHourDataFactory.create({
                            properties: {
                                day: day,
                                fromTime: (('0' + Math.floor(hourStart / 60)).slice(-2) + ':' + ('0' + (hourStart % 60)).slice(-2)),
                                toTime:   (('0' + Math.floor(hourEnd   / 60)).slice(-2) + ':' + ('0' + (hourEnd   % 60)).slice(-2)),
                                difference: hourEnd - hourStart
                        }});
                });
            } else {
                loginHours = [];
            }

            // Ip Ranges
            let ipRanges;
            if (record.Metadata.loginIpRanges?.length ?? 0 > 0) {
                ipRanges = await MediumProcessor.map(
                    record.Metadata.loginIpRanges,
                    (range: any) => {
                        const startNumber = COMPUTE_NUMBER_FROM_IP(range.startAddress);
                        const endNumber = COMPUTE_NUMBER_FROM_IP(range.endAddress);
                        return ipRangeDataFactory.create({
                            properties: {
                                startAddress: range.startAddress,
                                endAddress: range.endAddress,
                                description: range.description || '(empty)',
                                difference: endNumber - startNumber + 1
                        }});
                });
            } else {
                ipRanges = [];
            }

            // Create the instance
            const profileRestriction = restrictionsFactory.createWithScore({
                properties: {
                    profileId: profileId,
                    ipRanges: ipRanges,
                    loginHours: loginHours
                }
            });

            // Add it to the map  
            return [ profileRestriction.profileId, profileRestriction ];
        }));

        // Return data as map
        logger?.log(`Done.`);
        return profileRestrictions;
    } 
}