import { DataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { Dataset } from '../core/orgcheck-api-dataset';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { Processor } from '../core/orgcheck-api-processing';
import { SalesforceMetadataTypes } from '../core/orgcheck-api-salesforce-metadatatypes';
import { SalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';
import { SFDC_Profile } from '../data/orgcheck-api-data-profile';

export class DatasetProfiles extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager
     * @param {DataFactoryIntf} dataFactory
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<Map<string, SFDC_Profile>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First SOQL query
        logger?.log(`Querying REST API about PermissionSet with IsOwnedByProfile=true in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            string: 'SELECT ProfileId, Profile.Name, Profile.Description, IsCustom, License.Name, NamespacePrefix, ' +
                        'PermissionsApiEnabled, PermissionsViewSetup, PermissionsModifyAllData, PermissionsViewAllData, ' +
                        'CreatedDate, LastModifiedDate, ' +
                        '(SELECT Id FROM FieldPerms LIMIT 51), ' +
                        '(SELECT Id FROM ObjectPerms LIMIT 51), ' +
                        '(SELECT Id FROM Assignments WHERE Assignee.IsActive = TRUE LIMIT 51) ' +
                    'FROM PermissionSet ' + // oh yes we are not mistaken!
                    'WHERE isOwnedByProfile = TRUE'
        }], logger);

        // Init the factory and records
        const profileDataFactory = dataFactory.getInstance(SFDC_Profile);

        // Create the map
        const profileRecords = results[0];
        logger?.log(`Parsing ${profileRecords.length} profiles...`);
        const profiles = new Map(await Processor.map(profileRecords, (record) => {

            // Get the ID15
            const id = sfdcManager.caseSafeId(record.ProfileId);

            // Create the instance
            const profile = profileDataFactory.create({
                properties: {
                    id: id,
                    name: record.Profile.Name,
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
                        apiEnabled: record.PermissionsApiEnabled === true,
                        viewSetup: record.PermissionsViewSetup === true, 
                        modifyAllData: record.PermissionsModifyAllData === true, 
                        viewAllData: record.PermissionsViewAllData === true
                    },
                    url: sfdcManager.setupUrl(id, SalesforceMetadataTypes.PROFILE)
                }
            });

            // Add it to the map  
            return [ profile.id, profile ];
        }));

        // Compute scores for all permission sets
        logger?.log(`Computing the score for ${profiles.size} profiles...`);
        await Processor.forEach(profiles, (profile) => {
            profileDataFactory.computeScore(profile);
        });

        // Return data as map
        logger?.log(`Done`);
        return profiles;
    } 
}