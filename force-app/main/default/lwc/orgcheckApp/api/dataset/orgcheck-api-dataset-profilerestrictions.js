import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { SFDC_ProfileRestrictions, 
            SFDC_ProfileIpRangeRestriction,
            SFDC_ProfileLoginHourRestriction } from '../data/orgcheck-api-data-profilerestrictions';

const COMPUTE_NUMBER_FROM_IP = (ip) => {
    return ip?.split('.').reduce((prev, currentItem, currentIndex, array) => { return prev + Number(currentItem) * Math.pow(255, array.length-1-currentIndex); }, 0);
}

export class OrgCheckDatasetProfileRestrictions extends OrgCheckDataset {

    run(sfdcManager, localLogger, resolve, reject) {

        // List all ids for Profiles
        // (only ids because metadata can't be read via SOQL in bulk!
        sfdcManager.soqlQuery([{ 
            string: 'SELECT Id FROM Profile'
        }]).then((results) => {
            
            // List of profile ids
            localLogger.log(`Parsing ${results[0].records.length} Profiles...`);
            const profileIds = results[0].records.map((record) => record.Id);

            // Init the map
            const profileRestrictions = new Map();

            // Get information about profiles using metadata
            localLogger.log(`Calling Composite Tooling API to get Metadata information about ${profileIds.length} profiles and their restrictions...`);
            sfdcManager.readMetadataAtScale('Profile', profileIds, [ 'UNKNOWN_EXCEPTION' ])
                .then((records) => {
                    localLogger.log(`Parsing ${records.length} Profile...`);
                    records.forEach((record)=> {
                        // Get the ID15 of this profile
                        const profileId = sfdcManager.caseSafeId(record.Id);

                        // Login Hours
                        const loginHours = [];
                        if (record.Metadata.loginHours) {
                            const days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
                            days.forEach(d => {
                                const hourStart = record.Metadata.loginHours[d + 'Start'];
                                const hourEnd = record.Metadata.loginHours[d + 'End'];
                                loginHours.push(new SFDC_ProfileLoginHourRestriction({
                                    day: d,
                                    fromTime: (('0' + Math.floor(hourStart / 60)).slice(-2) + ':' + ('0' + (hourStart % 60)).slice(-2)),
                                    toTime:   (('0' + Math.floor(hourEnd   / 60)).slice(-2) + ':' + ('0' + (hourEnd   % 60)).slice(-2)),
                                    difference: hourEnd - hourStart
                                }));
                            });
                        }

                        // Ip Ranges
                        const ipRanges = [];
                        if (record.Metadata.loginIpRanges && record.Metadata.loginIpRanges.length > 0) {
                            record.Metadata.loginIpRanges.forEach(i => {
                                const startNumber = COMPUTE_NUMBER_FROM_IP(i.startAddress);
                                const endNumber = COMPUTE_NUMBER_FROM_IP(i.endAddress);
                                ipRanges.push(new SFDC_ProfileIpRangeRestriction({
                                    startAddress: i.startAddress,
                                    endAddress: i.endAddress,
                                    description: i.description,
                                    difference: endNumber - startNumber
                                }));
                            });
                        }

                        // Skip if no restriction at all
                        if (loginHours.length === 0 && ipRanges.length === 0) {
                            return;
                        }

                        // Create the instance
                        const profileRestriction = new SFDC_ProfileRestrictions({
                            profileId: profileId,
                            ipRanges: ipRanges,
                            loginHours: loginHours,
                            isScoreNeeded: true
                        });

                        // Compute the score of this profile restriction, with the following rule:
                        //   - If ip range difference is bigger than 100k, then you get +1.
                        //   - If login hour difference is bigger than 20 huurs long (per day), then you get +1.
                        if (profileRestriction.ipRanges.filter(i => i.difference > 100000).length > 0) profileRestriction.setBadField('ipRanges');
                        if (profileRestriction.loginHours.filter(i => i.difference > 1200).length > 0) profileRestriction.setBadField('loginHours');

                        // Add it to the map                        
                        profileRestrictions.set(profileRestriction.profileId, profileRestriction);                    
                    });

                    // Return data
                    resolve(profileRestrictions);

                }).catch(reject);
        }).catch(reject);
    } 
}