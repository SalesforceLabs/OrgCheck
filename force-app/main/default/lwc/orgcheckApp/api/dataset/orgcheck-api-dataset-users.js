import { OrgCheckDataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { OrgCheckSimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';
import { OrgCheckSalesforceMetadataTypes } from '../core/orgcheck-api-salesforce-metadatatypes';
import { OrgCheckSalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';
import { SFDC_User } from '../data/orgcheck-api-data-user';

export class OrgCheckDatasetUsers extends OrgCheckDataset {

    /**
     * @description Run the dataset and return the result
     * @param {OrgCheckSalesforceManagerIntf} sfdcManager
     * @param {OrgCheckDataFactoryIntf} dataFactory
     * @param {OrgCheckSimpleLoggerIntf} logger
     * @returns {Promise<Map<string, SFDC_User>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First SOQL query
        logger?.log(`Querying REST API about internal active User in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            string: 'SELECT Id, Name, SmallPhotoUrl, ProfileId, ' +
                        'LastLoginDate, LastPasswordChangeDate, NumberOfFailedLogins, ' +
                        'UserPreferencesLightningExperiencePreferred, ' +
                        '(SELECT PermissionSetId FROM PermissionSetAssignments WHERE PermissionSet.IsOwnedByProfile = false) ' +
                    'FROM User ' +
                    'WHERE IsActive = true ' + // we only want active users
                    'AND ContactId = NULL ' + // only internal users
                    'AND Profile.Id != NULL ', // we do not want the Automated Process users!
            tooling: false,
            byPasses: [],
            queryMoreField: ''
        }], logger);

        // Init the factory and records
        const userDataFactory = dataFactory.getInstance(SFDC_User);

        // Create the map
        const userRecords = results[0].records;
        logger?.log(`Parsing ${userRecords.length} users...`);
        const users = new Map(await OrgCheckProcessor.map(userRecords, async (record) => {
        
            // Get the ID15 of this user
            const id = sfdcManager.caseSafeId(record.Id);

            // Get the ID15 of Permission Sets assigned to this user
            const permissionSetIdsAssigned = await OrgCheckProcessor.map(
                record?.PermissionSetAssignments?.records, 
                (assignment) => sfdcManager.caseSafeId(assignment.PermissionSetId)
            );

            // Create the instance
            const user = userDataFactory.createWithScore({
                properties: {
                    id: id,
                    photoUrl: record.SmallPhotoUrl,
                    name: record.Name,
                    lastLogin: record.LastLoginDate,
                    numberFailedLogins: record.NumberOfFailedLogins,
                    onLightningExperience: record.UserPreferencesLightningExperiencePreferred,
                    lastPasswordChange: record.LastPasswordChangeDate,
                    profileId: sfdcManager.caseSafeId(record.ProfileId),
                    permissionSetIds: permissionSetIdsAssigned,
                    url: sfdcManager.setupUrl(id, OrgCheckSalesforceMetadataTypes.USER)
                }
            });

            // Add it to the map  
            return [ user.id, user ];
        }));

        // Return data as map
        logger?.log(`Done`);
        return users;
    } 
}