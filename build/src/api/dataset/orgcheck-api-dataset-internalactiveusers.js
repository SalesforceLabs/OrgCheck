import { DataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { Dataset } from '../core/orgcheck-api-dataset';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { Processor } from '../core/orgcheck-api-processor';
import { SalesforceMetadataTypes } from '../core/orgcheck-api-salesforce-metadatatypes';
import { SalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';
import { SFDC_User } from '../data/orgcheck-api-data-user';

export class DatasetInternalActiveUsers extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @returns {Promise<Map<string, SFDC_User>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First SOQL queries
        logger?.log(`Querying REST API about internal active User in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            string: 'SELECT Id, Name, ProfileId, LastLoginDate, LastPasswordChangeDate, NumberOfFailedLogins, ' +
                        'UserPreferencesLightningExperiencePreferred ' +
                    'FROM User ' +
                    'WHERE IsActive = true ' + // we only want active users
                    'AND ContactId = NULL ' + // only internal users
                    'AND Profile.Id != NULL ' // we do not want the Automated Process users!
        }, {
            string: 'SELECT Id, AssigneeId, PermissionSetId ' +
                    'FROM PermissionSetAssignment ' +
                    'WHERE Assignee.IsActive = true ' +
                    'AND PermissionSet.IsOwnedByProfile = false ' +
                    'AND Assignee.ContactId = NULL ' +
                    'AND Assignee.Profile.Id != NULL',
            queryMoreField: 'Id'
        }], logger);

        // Init the factory and records
        const userDataFactory = dataFactory.getInstance(SFDC_User);

        // Create the map
        const userRecords = results[0];
        const assignmentRecords = results[1];
        logger?.log(`Parsing ${userRecords.length} users...`);
        const users = new Map(await Processor.map(userRecords, async (/** @type {any} */ record) => {
        
            // Get the ID15 of this user
            const id = sfdcManager.caseSafeId(record.Id);

            // Create the instance
            const user = userDataFactory.create({
                properties: {
                    id: id,
                    name: record.Name,
                    lastLogin: record.LastLoginDate,
                    numberFailedLogins: record.NumberOfFailedLogins,
                    onLightningExperience: record.UserPreferencesLightningExperiencePreferred,
                    lastPasswordChange: record.LastPasswordChangeDate,
                    profileId: sfdcManager.caseSafeId(record.ProfileId),
                    permissionSetIds: [],
                    url: sfdcManager.setupUrl(id, SalesforceMetadataTypes.USER)
                }
            });

            // Add it to the map  
            return [ user.id, user ];
        }));

        // Now process the permission set assignments
        logger?.log(`Parsing ${assignmentRecords.length} permission set assignments...`);
        assignmentRecords.forEach((/** @type {any} */ record) => {
            const assigneeId = sfdcManager.caseSafeId(record.AssigneeId);
            const permissionSetId = sfdcManager.caseSafeId(record.PermissionSetId);
            const user = users.get(assigneeId);
            if (user) {
                user.permissionSetIds.push(permissionSetId);
            }
        });

        // FINALLY!!!! Compute the score of all items
        logger?.log(`Computing scores for ${users.size} users...`);
        await Processor.forEach(users, (/** @type {SFDC_User} */ user) => {
            userDataFactory.computeScore(user);
        });

        // Return data as map
        logger?.log(`Done`);
        return users;
    } 
}