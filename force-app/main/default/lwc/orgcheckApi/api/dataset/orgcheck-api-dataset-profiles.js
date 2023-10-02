import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { OrgCheckMap } from '../core/orgcheck-api-type-map';
import { SFDC_Profile } from '../data/orgcheck-api-data-profile';

export class OrgCheckDatasetProfiles extends OrgCheckDataset {

    run(sfdcManager, resolve, reject) {

        // SOQL query on PermissionSet with isOwnedByProfile = TRUE
        sfdcManager.soqlQuery([{ 
            string: 'SELECT ProfileId, Profile.Name, Profile.Description, IsCustom, License.Name, NamespacePrefix, '+
                        'CreatedDate, LastModifiedDate, '+
                        '(SELECT Id FROM Assignments WHERE Assignee.IsActive = TRUE LIMIT 51), '+
                        '(SELECT Id FROM FieldPerms LIMIT 51), '+
                        '(SELECT Id FROM ObjectPerms LIMIT 51)'+
                    'FROM PermissionSet '+ // oh yes we are not mistaken!
                    'WHERE isOwnedByProfile = TRUE'
        }]).then((results) => {

            // Init the map
            const profiles = new OrgCheckMap();

            // Set the map
            results[0].records
                .forEach((record) => {

                    // Get the ID15 of this profile
                    const profileId = sfdcManager.caseSafeId(record.ProfileId);

                    // Create the SFDC_Profile instance
                    const profile = new SFDC_Profile({
                        id: profileId,
                        url: sfdcManager.setupUrl('profile', profileId),
                        name: record.Profile.Name,
                        apiName: (record.NamespacePrefix ? (record.NamespacePrefix + '__') : '') + record.Profile.Name,
                        description: record.Profile.Description,
                        license: (record.License ? record.License.Name : ''),
                        isCustom: record.IsCustom,
                        package: (record.NamespacePrefix || ''),
                        memberCounts: (record.Assignments && record.Assignments.records) ? record.Assignments.records.length : 0,
                        createdDate: record.CreatedDate, 
                        lastModifiedDate: record.LastModifiedDate,
                        nbFieldPermissions: record.FieldPerms?.records.length || 0,
                        nbObjectPermissions: record.ObjectPerms?.records.length || 0,
                        isScoreNeeded: true
                    });

                    // Compute the score of this profile, with the following rule:
                    //   - If it is custom and is not used by any active users, then you get +1.
                    //   - If it is custom and has no description, then you get +1.
                    if (profile.isCustom === true && profile.memberCounts === 0) profile.setBadField('memberCounts');
                    if (profile.isCustom === true && sfdcManager.isEmpty(profile.description)) profile.setBadField('description');

                    // Add it to the map                        
                    profiles.set(profile.id, profile);                    
                });

            // Return data
            resolve(profiles);
        }).catch(reject);
    } 
}