import { OrgCheckDataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { OrgCheckSimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';
import { OrgCheckSalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';
import { SFDC_ProfileRestrictions, 
            SFDC_ProfileIpRangeRestriction,
            SFDC_ProfileLoginHourRestriction } from '../data/orgcheck-api-data-profilerestrictions';

const COMPUTE_NUMBER_FROM_IP = (ip) => {
    return ip?.split('.').reduce((prev, currentItem, currentIndex, array) => { 
        return prev + Number(currentItem) * Math.pow(255, array.length-1-currentIndex); 
    }, 0);
}

const WEEKDAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

export class OrgCheckDatasetProfileRestrictions extends OrgCheckDataset {

    /**
     * @description Run the dataset and return the result
     * @param {OrgCheckSalesforceManagerIntf} sfdcManager
     * @param {OrgCheckDataFactoryIntf} dataFactory
     * @param {OrgCheckSimpleLoggerIntf} logger
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
        const profileIds = await OrgCheckProcessor.map(profileIdRecords, (record) => record.Id);

        // Init the factories
        const restrictionsFactory = dataFactory.getInstance(SFDC_ProfileRestrictions);
        const ipRangeDataFactory = dataFactory.getInstance(SFDC_ProfileIpRangeRestriction);
        const loginHourDataFactory = dataFactory.getInstance(SFDC_ProfileLoginHourRestriction);

        // Get information about profiles using metadata
        logger?.log(`Calling Tooling API Composite to get more information about these ${profileIds.length} profiles...`);
        const records = await sfdcManager.readMetadataAtScale('Profile', profileIds, [ 'UNKNOWN_EXCEPTION' ], logger);

        // Create the map
        logger?.log(`Parsing ${records.length} profile restrictions...`);
        const profileRestrictions = new Map(await OrgCheckProcessor.map(records, async (record) => {

            // Get the ID15 of this profile
            const profileId = sfdcManager.caseSafeId(record.Id);

            // Login Hours
            let loginHours;
            if (record.Metadata.loginHours) {
                loginHours = await OrgCheckProcessor.map(
                    WEEKDAYS,
                    (day) => {
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
            if (record.Metadata.loginIpRanges && record.Metadata.loginIpRanges.length > 0) {
                ipRanges = await OrgCheckProcessor.map(
                    record.Metadata.loginIpRanges,
                    range => {
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
        logger?.log(`Done`);
        return profileRestrictions;
    } 
}