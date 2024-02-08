import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { SFDC_ProfileRestrictions, 
            SFDC_ProfileIpRangeRestriction,
            SFDC_ProfileLoginHourRestriction } from '../data/orgcheck-api-data-profilerestrictions';

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
                                const c1 = record.Metadata.loginHours[d + 'Start'];
                                const c2 = record.Metadata.loginHours[d + 'End'];
                                loginHours.push(new SFDC_ProfileLoginHourRestriction({
                                    day: d,
                                    fromTime: (('0' + Math.floor(c1 / 60)).slice(-2) + ':' + ('0' + (c1 % 60)).slice(-2)),
                                    toTime:   (('0' + Math.floor(c2 / 60)).slice(-2) + ':' + ('0' + (c2 % 60)).slice(-2))
                                }));
                            });
                        }

                        // Ip Ranges
                        const ipRanges = [];
                        if (record.Metadata.loginIpRanges) {
                            record.Metadata.loginIpRanges.forEach(i => {
                                ipRanges.push(new SFDC_ProfileIpRangeRestriction({
                                    startAddress: i.startAddress,
                                    endAddress: i.endAddress,
                                    description: i.description
                                }));
                            });
                        }

                        // Create the instance
                        const profileRestriction = new SFDC_ProfileRestrictions({
                            profileId: profileId,
                            ipRanges: ipRanges,
                            loginHours: loginHours
                        });

                        // Add it to the map                        
                        profileRestrictions.set(profileRestriction.profileId, profileRestriction);                    
                    });

                    // Return data
                    resolve(profileRestrictions);

                }).catch(reject);
        }).catch(reject);
    } 
}