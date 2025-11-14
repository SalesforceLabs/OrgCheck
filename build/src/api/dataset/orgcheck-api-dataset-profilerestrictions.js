import { DataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { Dataset } from '../core/orgcheck-api-dataset';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { Processor } from '../core/orgcheck-api-processor';
import { SalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';
import { SFDC_ProfileRestrictions, 
            SFDC_ProfileIpRangeRestriction,
            SFDC_ProfileLoginHourRestriction } from '../data/orgcheck-api-data-profilerestrictions';

const COMPUTE_NUMBER_FROM_IP = (/** @type {string} */ ip) => {
    return ip?.split('.').reduce((prev, currentItem, currentIndex, array) => { 
        return prev + Number(currentItem) * Math.pow(255, array.length-1-currentIndex); 
    }, 0);
}

const WEEKDAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

export class DatasetProfileRestrictions extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @returns {Promise<Map<string, SFDC_ProfileRestrictions>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First SOQL query
        // (only ids because metadata can't be read via SOQL in bulk!
        logger?.log(`Querying REST API about Profile in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            string: 'SELECT Id FROM Profile'
        }], logger);
            
        // List of profile ids
        const profileIdRecords = results[0];
        logger?.log(`Parsing ${profileIdRecords.length} Profiles...`);
        const profileIds = await Processor.map(profileIdRecords, (/** @type {any} */ record) => record.Id);

        // Init the factories
        const restrictionsFactory = dataFactory.getInstance(SFDC_ProfileRestrictions);
        const ipRangeDataFactory = dataFactory.getInstance(SFDC_ProfileIpRangeRestriction);
        const loginHourDataFactory = dataFactory.getInstance(SFDC_ProfileLoginHourRestriction);

        // Get information about profiles using metadata
        logger?.log(`Calling Tooling API Composite to get more information about these ${profileIds.length} profiles...`);
        const records = await sfdcManager.readMetadataAtScale('Profile', profileIds, [ 'UNKNOWN_EXCEPTION' ], logger);

        // Create the map
        logger?.log(`Parsing ${records.length} profile restrictions...`);
        const profileRestrictions = new Map(await Processor.map(records, async (/** @type {any} */ record) => {

            // Get the ID15 of this profile
            const profileId = sfdcManager.caseSafeId(record.Id);

            // Login Hours
            let loginHours;
            if (record.Metadata.loginHours) {
                loginHours = await Processor.map(
                    WEEKDAYS,
                    (/** @type {string} */ day) => {
                        const hourStart = record.Metadata.loginHours[day + 'Start'];
                        const hourEnd = record.Metadata.loginHours[day + 'End'];
                        /** @type {SFDC_ProfileLoginHourRestriction} */
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
                ipRanges = await Processor.map(
                    record.Metadata.loginIpRanges,
                    (/** @type {any} */ range) => {
                        const startNumber = COMPUTE_NUMBER_FROM_IP(range.startAddress);
                        const endNumber = COMPUTE_NUMBER_FROM_IP(range.endAddress);
                        /** @type {SFDC_ProfileIpRangeRestriction} */
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
        logger?.log(`Done`);
        return profileRestrictions;
    } 
}