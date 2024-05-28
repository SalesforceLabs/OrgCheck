import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { SFDC_Profile } from '../data/orgcheck-api-data-profile';

export class OrgCheckDatasetProfiles extends OrgCheckDataset {

    async run(sfdcManager, dataFactory, localLogger) {

        // First SOQL query
        localLogger.log(`Querying REST API about PermissionSet with IsOwnedByProfile=true in the org...`);            
        const results = await sfdcManager.soqlQuery([{ 
            string: 'SELECT ProfileId, Profile.Name, Profile.Description, IsCustom, License.Name, NamespacePrefix, '+
                        'CreatedDate, LastModifiedDate, '+
                        '(SELECT Id FROM Assignments WHERE Assignee.IsActive = TRUE LIMIT 51), '+
                        '(SELECT Id FROM FieldPerms LIMIT 51), '+
                        '(SELECT Id FROM ObjectPerms LIMIT 51)'+
                    'FROM PermissionSet '+ // oh yes we are not mistaken!
                    'WHERE isOwnedByProfile = TRUE'
        }], localLogger);

        // Init the factory
        const profileDataFactory = dataFactory.getInstance(SFDC_Profile);

        // Create the map
        localLogger.log(`Parsing ${results[0].records.length} profiles...`);
        const profiles = new Map(results[0].records.map((record) => {

            // Get the ID15
            const id = sfdcManager.caseSafeId(record.ProfileId);

            // Create the instance
            const profile = profileDataFactory.createWithScore({
                id: id,
                url: sfdcManager.setupUrl('profile', id),
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
                type: 'Profile'
            });

            // Add it to the map  
            return [ profile.id, profile ];
        }));

        // Return data as map
        localLogger.log(`Done`);
        return profiles;
    } 
}