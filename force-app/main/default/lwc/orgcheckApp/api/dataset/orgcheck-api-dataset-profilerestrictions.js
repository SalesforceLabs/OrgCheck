import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { SFDC_ProfileRestrictions, 
            SFDC_ProfileIpRangeRestriction,
            SFDC_ProfileLoginHourRestriction } from '../data/orgcheck-api-data-profilerestrictions';

const COMPUTE_NUMBER_FROM_IP = (ip) => {
    return ip?.split('.').reduce((prev, currentItem, currentIndex, array) => { return prev + Number(currentItem) * Math.pow(255, array.length-1-currentIndex); }, 0);
}

const WEEKDAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

export class OrgCheckDatasetProfileRestrictions extends OrgCheckDataset {

    async run(sfdcManager, dataFactory, localLogger) {

        // First SOQL query
        // (only ids because metadata can't be read via SOQL in bulk!
        localLogger.log(`Querying REST API about Profile in the org...`);            
        const results = await sfdcManager.soqlQuery([{ 
            string: 'SELECT Id FROM Profile'
        }], localLogger);
            
        // List of profile ids
        localLogger.log(`Parsing ${results[0].records.length} Profiles...`);
        const profileIds = results[0].records.map((record) => record.Id);

        // Init the factories
        const restrictionsFactory = dataFactory.getInstance(SFDC_ProfileRestrictions);
        const ipRangeDataFactory = dataFactory.getInstance(SFDC_ProfileIpRangeRestriction);
        const loginHourDataFactory = dataFactory.getInstance(SFDC_ProfileLoginHourRestriction);

        // Get information about profiles using metadata
        localLogger.log(`Calling Tooling API Composite to get more information about these ${profileIds.length} profiles...`);
        const records = await sfdcManager.readMetadataAtScale('Profile', profileIds, [ 'UNKNOWN_EXCEPTION' ]);

        // Create the map
        localLogger.log(`Parsing ${records.length} profile restrictions...`);
        const profileRestrictions = new Map(records.map((record) => {

            // Get the ID15 of this profile
            const profileId = sfdcManager.caseSafeId(record.Id);

            // Login Hours
            let loginHours;
            if (record.Metadata.loginHours) {
                loginHours = WEEKDAYS.map(d => {
                    const hourStart = record.Metadata.loginHours[d + 'Start'];
                    const hourEnd = record.Metadata.loginHours[d + 'End'];
                    return loginHourDataFactory.create({
                        day: d,
                        fromTime: (('0' + Math.floor(hourStart / 60)).slice(-2) + ':' + ('0' + (hourStart % 60)).slice(-2)),
                        toTime:   (('0' + Math.floor(hourEnd   / 60)).slice(-2) + ':' + ('0' + (hourEnd   % 60)).slice(-2)),
                        difference: hourEnd - hourStart
                    });
                });
            } else {
                loginHours = [];
            }

            // Ip Ranges
            let ipRanges;
            if (record.Metadata.loginIpRanges && record.Metadata.loginIpRanges.length > 0) {
                ipRanges = record.Metadata.loginIpRanges.map(i => {
                    const startNumber = COMPUTE_NUMBER_FROM_IP(i.startAddress);
                    const endNumber = COMPUTE_NUMBER_FROM_IP(i.endAddress);
                    return ipRangeDataFactory.create({
                        startAddress: i.startAddress,
                        endAddress: i.endAddress,
                        description: i.description || '(empty)',
                        difference: endNumber - startNumber + 1
                    });
                });
            } else {
                ipRanges = [];
            }

            // Create the instance
            const profileRestriction = restrictionsFactory.createWithScore({
                profileId: profileId,
                ipRanges: ipRanges,
                loginHours: loginHours
            });

            // Add it to the map  
            return [ profileRestriction.profileId, profileRestriction ];
        }));

        // Return data as map
        localLogger.log(`Done`);
        return profileRestrictions;
    } 
}