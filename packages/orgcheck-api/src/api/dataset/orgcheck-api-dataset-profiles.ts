import { DataAliases } from 'src/api/core/data/orgcheck-api-data-aliases';
import { DataFactoryIntf } from 'src/api/core/data/orgcheck-api-datafactory';
import { Dataset } from 'src/api/core/dataset/orgcheck-api-dataset';
import { SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { MediumProcessor } from 'src/api/core/orgcheck-api-processor';
import { SalesforceMetadataTypes } from 'src/api/core/salesforce/orgcheck-api-salesforce-metadatatypes';
import { SalesforceManagerIntf } from 'src/api/core/salesforce/orgcheck-api-salesforcemanager';
import { SfdcProfile } from 'src/api/data/orgcheck-api-data-profile';

export class DatasetProfiles implements Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @returns {Promise<Map<string, SfdcProfile>>} The result of the dataset
     */
    async run(sfdcManager: SalesforceManagerIntf, dataFactory: DataFactoryIntf, logger: SimpleLoggerIntf): Promise<Map<string, SfdcProfile>> {

        // First SOQL query
        logger?.log(`Querying REST API about PermissionSet with IsOwnedByProfile=true in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            string: 'SELECT ProfileId, Profile.Name, Profile.Description, IsCustom, License.Name, NamespacePrefix, ' +
                        'PermissionsApiEnabled, PermissionsViewSetup, PermissionsModifyAllData, PermissionsViewAllData, ' +
                        'PermissionsManageUsers, PermissionsCustomizeApplication, ' +
                        'CreatedDate, LastModifiedDate ' +
                    'FROM PermissionSet ' + // oh yes we are not mistaken!
                    'WHERE isOwnedByProfile = TRUE '+
                    'ORDER BY ProfileId '
        }, {
            string: 'SELECT Parent.ProfileId, COUNT(SobjectType) CountObject '+ // warning: 'ProfileId' will be used as 'Parent.ProfileId' (bc aggregate query)
                    'FROM ObjectPermissions '+
                    'WHERE Parent.IsOwnedByProfile = TRUE '+
                    'GROUP BY Parent.ProfileId ',
            queryMoreField: 'CreatedDate' // aggregate does not support calling QueryMore, use the custom instead
        },{
            string: 'SELECT Parent.ProfileId, COUNT(Field) CountField '+ // warning: 'ProfileId' will be used as 'Parent.ProfileId' (bc aggregate query)
                    'FROM FieldPermissions '+
                    'WHERE Parent.IsOwnedByProfile = TRUE '+
                    'GROUP BY Parent.ProfileId ',
            queryMoreField: 'SystemModstamp' // aggregate does not support calling QueryMore, use the custom instead
        },{
            string: 'SELECT PermissionSet.ProfileId, COUNT(Id) CountAssignment '+ // warning: 'ProfileId' will be used as 'PermissionSet.ProfileId' (bc aggregate query)
                    'FROM PermissionSetAssignment '+
                    'WHERE PermissionSet.IsOwnedByProfile = TRUE '+
                    'AND Assignee.IsActive = TRUE '+
                    'GROUP BY PermissionSet.ProfileId ',
            queryMoreField: 'SystemModstamp' // aggregate does not support calling QueryMore, use the custom instead
        }], logger);

        // All salesforce records
        const profileRecords = results[0];
        const objectPermissionRecords = results[1];
        const fieldPermissionRecords = results[2];
        const assignmentRecords = results[3];

        // Init the factory and records
        const profileDataFactory = dataFactory.getInstance(DataAliases.SfdcProfile);

        // Create the map of profiles
        logger?.log(`Parsing ${profileRecords?.length} profiles...`);
        const profiles: Map<string, SfdcProfile> = new Map(await MediumProcessor.map(profileRecords, (record: Record<string, unknown>) => {

            // Get the ID15
            const id = sfdcManager.caseSafeId(record.ProfileId as string);

            // Create the instance
            const profile: SfdcProfile = profileDataFactory.create({
                properties: {
                    id: id,
                    name: (record.Profile as Record<string, unknown>).Name as string,
                    description: (record.Profile as Record<string, unknown>).Description as string,
                    license: (record.License ? (record.License as Record<string, unknown>).Name as string : ''),
                    isCustom: record.IsCustom,
                    package: (record.NamespacePrefix || ''),
                    memberCounts: 0, // default value, may be changed in further SOQL
                    createdDate: record.CreatedDate, 
                    lastModifiedDate: record.LastModifiedDate,
                    nbFieldPermissions: 0, // default value, may be changed in further SOQL
                    nbObjectPermissions: 0, // default value, may be changed in further SOQL
                    type: 'Profile',
                    importantPermissions: {
                        apiEnabled: record.PermissionsApiEnabled === true,
                        viewSetup: record.PermissionsViewSetup === true, 
                        modifyAllData: record.PermissionsModifyAllData === true, 
                        viewAllData: record.PermissionsViewAllData === true,
                        manageUsers: record.PermissionsManageUsers === true,
                        customizeApplication: record.PermissionsCustomizeApplication === true
                    },
                    isAdminLike: (
                        record.PermissionsModifyAllData === true || 
                        record.PermissionsViewAllData === true ||
                        record.PermissionsManageUsers === true || 
                        record.PermissionsCustomizeApplication === true
                    ),
                    url: sfdcManager.setupUrl(id, SalesforceMetadataTypes.PROFILE)
                }
            });

            // Add it to the map  
            return [ profile.id, profile ];
        }));

        logger?.log(`Parsing ${objectPermissionRecords?.length} object permissions, ${fieldPermissionRecords?.length} field permissions and ${assignmentRecords?.length} assignments...`);
        await Promise.all([
            MediumProcessor.forEach(objectPermissionRecords, async (record: Record<string, unknown>) => {
                const profileId = sfdcManager.caseSafeId(record.ProfileId as string); // see warning in the SOQL query (this is not a bug we use ProfileId instead of Parent.ProfileId)
                const profile = profiles.get(profileId);
                if (profile) {
                    profile.nbObjectPermissions += record.CountObject as number;
                }
            }),
            MediumProcessor.forEach(fieldPermissionRecords, async (record: Record<string, unknown>) => {
                const profileId = sfdcManager.caseSafeId(record.ProfileId as string); // see warning in the SOQL query (this is not a bug we use ProfileId instead of Parent.ProfileId)
                const profile = profiles.get(profileId);
                if (profile) {
                    profile.nbFieldPermissions += record.CountField as number;    
                }
            }),
            MediumProcessor.forEach(assignmentRecords, async (record: Record<string, unknown>) => {
                const profileId = sfdcManager.caseSafeId(record.ProfileId as string); // see warning in the SOQL query (this is not a bug we use ProfileId instead of PermissionSet.ProfileId)
                const profile = profiles.get(profileId);
                if (profile) {
                    profile.memberCounts += record.CountAssignment as number;    
                }
            })
        ]);

        // Compute scores for all permission sets
        logger?.log(`Computing the score for ${profiles.size} profiles...`);
        await MediumProcessor.forEach(profiles, async (profile: SfdcProfile) => {
            profileDataFactory.computeScore(profile);
        });

        // Return data as map
        logger?.log(`Done.`);
        return profiles;
    } 
}