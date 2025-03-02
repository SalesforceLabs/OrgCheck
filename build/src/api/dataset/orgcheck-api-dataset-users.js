import { DataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { Dataset } from '../core/orgcheck-api-dataset';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { Processor } from '../core/orgcheck-api-processing';
import { SalesforceMetadataTypes } from '../core/orgcheck-api-salesforce-metadatatypes';
import { SalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';
import { SFDC_User } from '../data/orgcheck-api-data-user';

export class DatasetUsers extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager
     * @param {DataFactoryIntf} dataFactory
     * @param {SimpleLoggerIntf} logger
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
                    'AND Profile.Id != NULL ' // we do not want the Automated Process users!
        }], logger);

        // Init the factory and records
        const userDataFactory = dataFactory.getInstance(SFDC_User);

        // Create the map
        const userRecords = results[0];
        logger?.log(`Parsing ${userRecords.length} users...`);
        const users = new Map(await Processor.map(userRecords, async (record) => {
        
            // Get the ID15 of this user
            const id = sfdcManager.caseSafeId(record.Id);

            // Get the ID15 of Permission Sets assigned to this user
            const permissionSetIdsAssigned = await Processor.map(
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
                    url: sfdcManager.setupUrl(id, SalesforceMetadataTypes.USER)
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