import { DataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { Dataset } from '../core/orgcheck-api-dataset';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { Processor } from '../core/orgcheck-api-processor';
import { SalesforceMetadataTypes } from '../core/orgcheck-api-salesforce-metadatatypes';
import { SalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';
import { SFDC_Profile } from '../data/orgcheck-api-data-profile';

export class DatasetProfiles implements Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @returns {Promise<Map<string, SFDC_Profile>>} The result of the dataset
     */
    async run(sfdcManager: SalesforceManagerIntf, dataFactory: DataFactoryIntf, logger: SimpleLoggerIntf): Promise<Map<string, SFDC_Profile>> {

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
        const profileDataFactory = dataFactory.getInstance(SFDC_Profile);

        // Create the map of profiles
        logger?.log(`Parsing ${profileRecords?.length} profiles...`);
        const profiles: Map<string, SFDC_Profile> = new Map(await Processor.map(profileRecords, (/** @type {any} */ record: any) => {

            // Get the ID15
            const id = sfdcManager.caseSafeId(record.ProfileId);

            // Create the instance
            /** @type {SFDC_Profile} */
            const profile: SFDC_Profile = profileDataFactory.create({
                properties: {
                    id: id,
                    name: record.Profile.Name,
                    description: record.Profile.Description,
                    license: (record.License ? record.License.Name : ''),
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
            Processor.forEach(objectPermissionRecords, (/** @type {any} */ record: any) => {
                const profileId = sfdcManager.caseSafeId(record.ProfileId); // see warning in the SOQL query (this is not a bug we use ProfileId instead of Parent.ProfileId)
                if (profiles.has(profileId)) {
                    const profile = profiles.get(profileId);
                    profile.nbObjectPermissions += record.CountObject;
                }
            }),
            Processor.forEach(fieldPermissionRecords, (/** @type {any} */ record: any) => {
                const profileId = sfdcManager.caseSafeId(record.ProfileId); // see warning in the SOQL query (this is not a bug we use ProfileId instead of Parent.ProfileId)
                if (profiles.has(profileId)) {
                    const profile = profiles.get(profileId);
                    profile.nbFieldPermissions += record.CountField;    
                }
            }),
            Processor.forEach(assignmentRecords, (/** @type {any} */ record: any) => {
                const profileId = sfdcManager.caseSafeId(record.ProfileId); // see warning in the SOQL query (this is not a bug we use ProfileId instead of PermissionSet.ProfileId)
                if (profiles.has(profileId)) {
                    const profile = profiles.get(profileId);
                    profile.memberCounts += record.CountAssignment;    
                }
            })
        ]);

        // Compute scores for all permission sets
        logger?.log(`Computing the score for ${profiles.size} profiles...`);
        await Processor.forEach(profiles, (/** @type {SFDC_Profile} */ profile: SFDC_Profile) => {
            profileDataFactory.computeScore(profile);
        });

        // Return data as map
        logger?.log(`Done`);
        return profiles;
    } 
}