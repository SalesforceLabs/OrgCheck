import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';
import { TYPE_PROFILE } from '../core/orgcheck-api-sfconnectionmanager';
import { SFDC_Profile } from '../data/orgcheck-api-data-profile';

export class OrgCheckDatasetProfiles extends OrgCheckDataset {

    async run(sfdcManager, dataFactory, localLogger) {

        // First SOQL query
        localLogger.log(`Querying REST API about PermissionSet with IsOwnedByProfile=true in the org...`);            
        const results = await sfdcManager.soqlQuery([{ 
            string: 'SELECT ProfileId, Profile.Name, Profile.Description, IsCustom, License.Name, NamespacePrefix, '+
                        'PermissionsApiEnabled, PermissionsViewSetup, PermissionsModifyAllData, PermissionsViewAllData, '+
                        'CreatedDate, LastModifiedDate, '+
                        '(SELECT Id FROM FieldPerms LIMIT 51), '+
                        '(SELECT Id FROM ObjectPerms LIMIT 51), '+
                        '(SELECT Id FROM Assignments WHERE Assignee.IsActive = TRUE LIMIT 51) '+
                    'FROM PermissionSet '+ // oh yes we are not mistaken!
                    'WHERE isOwnedByProfile = TRUE'
        }], localLogger);

        // Init the factory and records
        const profileDataFactory = dataFactory.getInstance(SFDC_Profile);

        // Create the map
        const profileRecords = results[0].records;
        localLogger.log(`Parsing ${profileRecords.length} profiles...`);
        const profiles = new Map(await OrgCheckProcessor.map(profileRecords, (record) => {

            // Get the ID15
            const id = sfdcManager.caseSafeId(record.ProfileId);

            // Create the instance
            const profile = profileDataFactory.create({
                properties: {
                    id: id,
                    name: record.Profile.Name,
                    apiName: (record.NamespacePrefix ? (record.NamespacePrefix + '__') : '') + record.Profile.Name,
                    description: record.Profile.Description,
                    license: (record.License ? record.License.Name : ''),
                    isCustom: record.IsCustom,
                    package: (record.NamespacePrefix || ''),
                    memberCounts: record.Assignments?.records.length || 0,
                    createdDate: record.CreatedDate, 
                    lastModifiedDate: record.LastModifiedDate,
                    nbFieldPermissions: record.FieldPerms?.records.length || 0,
                    nbObjectPermissions: record.ObjectPerms?.records.length || 0,
                    type: 'Profile',
                    importantPermissions: {
                        apiEnabled: record.PermissionsApiEnabled,
                        viewSetup: record.PermissionsViewSetup, 
                        modifyAllData: record.PermissionsModifyAllData, 
                        viewAllData: record.PermissionsViewAllData
                    },
                    url: sfdcManager.setupUrl(id, TYPE_PROFILE)
                }
            });

            // Add it to the map  
            return [ profile.id, profile ];
        }));

        // Compute scores for all permission sets
        localLogger.log(`Computing the score for ${profiles.size} profiles...`);
        await OrgCheckProcessor.forEach(profiles, (profile) => {
            profileDataFactory.computeScore(profile);
        });

        // Return data as map
        localLogger.log(`Done`);
        return profiles;
    } 
}