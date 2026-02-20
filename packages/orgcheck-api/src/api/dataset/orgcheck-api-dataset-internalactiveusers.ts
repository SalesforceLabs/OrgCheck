import { DataAliases } from '../core/orgcheck-api-data-aliases';
import { DataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { Dataset } from '../core/orgcheck-api-dataset';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { Processor } from '../core/orgcheck-api-processor';
import { SalesforceMetadataTypes } from '../core/orgcheck-api-salesforce-metadatatypes';
import { SalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';
import { SFDC_User } from '../data/orgcheck-api-data-user';

export class DatasetInternalActiveUsers implements Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @returns {Promise<Map<string, SFDC_User>>} The result of the dataset
     */
    async run(sfdcManager: SalesforceManagerIntf, dataFactory: DataFactoryIntf, logger: SimpleLoggerIntf): Promise<Map<string, SFDC_User>> {

        // First SOQL queries
        logger?.log(`Querying REST API about internal active User in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            string: 'SELECT Id, Name, ProfileId, LastLoginDate, LastPasswordChangeDate, NumberOfFailedLogins, ' +
                        'UserPreferencesLightningExperiencePreferred, UserPreferencesUserDebugModePref ' +
                    'FROM User ' +
                    'WHERE IsActive = true ' + // we only want active users
                    'AND ContactId = NULL ' + // only internal users
                    'AND Profile.Id != NULL ' // we do not want the Automated Process users!
        }, {
            string: 'SELECT Id, AssigneeId, PermissionSetId, PermissionSet.IsOwnedByProfile, ' +
                        'PermissionSet.PermissionsModifyAllData, ' +
                        'PermissionSet.PermissionsViewAllData, ' +
                        'PermissionSet.PermissionsManageUsers, ' +
                        'PermissionSet.PermissionsCustomizeApplication, ' +
                        'PermissionSet.PermissionsBypassMFAForUiLogins ' +
                    'FROM PermissionSetAssignment ' +
                    'WHERE Assignee.IsActive = true ' +
                    'AND Assignee.ContactId = NULL ' +
                    'AND Assignee.Profile.Id != NULL'
        }, {
            string: 'SELECT UserId, Status, LoginType, COUNT(Id) CntLogins ' +
                    'FROM LoginHistory ' +
                    `WHERE (LoginType = 'Application' OR LoginType LIKE '%SSO%') ` + // the option 'queryMoreField' will add a final AND so that's why we have parenthesis here around the OR statement
                    'GROUP BY UserId, Status, LoginType ',
            queryMoreField: 'LoginTime' // aggregate does not support calling QueryMore, use the custom instead
        }, {
            string: 'SELECT UserId, Policy, COUNT(Id) CntVerifications ' +
                    'FROM VerificationHistory ' +
                    `WHERE Activity = 'Login' ` +
                    `AND Status IN ('AutomatedSuccess', 'Succeeded') ` +
                    `AND (LoginHistory.LoginType = 'Application') ` +
                    'GROUP BY UserId, Policy ',
            queryMoreField: 'VerificationTime' // aggregate does not support calling QueryMore, use the custom instead
        }], logger);

        // Init the factory and records
        const userDataFactory = dataFactory.getInstance(DataAliases.SFDC_User);

        // Create the map
        const userRecords = results[0];
        const assignmentRecords = results[1];
        const loginRecords = results[2];
        const verifRecords = results[3];
        logger?.log(`Parsing ${userRecords?.length} users...`);
        const users: Map<string, SFDC_User> = new Map(await Processor.map(userRecords, async (/** @type {any} */ record: any) => {
        
            // Get the ID15 of this user
            const id = sfdcManager.caseSafeId(record.Id);

            // Create the instance
            /** @type {SFDC_User} */
            const user: SFDC_User = userDataFactory.create({
                properties: {
                    id: id,
                    name: record.Name,
                    lastLogin: record.LastLoginDate,
                    numberFailedLogins: record.NumberOfFailedLogins,
                    onLightningExperience: record.UserPreferencesLightningExperiencePreferred === true,
                    lastPasswordChange: record.LastPasswordChangeDate,
                    profileId: sfdcManager.caseSafeId(record.ProfileId),
                    permissionSetIds: [],
                    isAdminLike: false,
                    hasMfaByPass: false,
                    hasDebugMode: record.UserPreferencesUserDebugModePref === true,
                    nbDirectLogins: 0,
                    nbDirectLoginsWithMFA: 0,
                    nbDirectLoginsWithoutMFA: 0,
                    nbSSOLogins: 0,
                    url: sfdcManager.setupUrl(id, SalesforceMetadataTypes.USER)
                }
            });

            // Add it to the map  
            return [ user.id, user ];
        }));

        // Now process the permission set assignments
        logger?.log(`Parsing ${assignmentRecords?.length} permission set assignments...`);
        assignmentRecords.forEach((/** @type {any} */ record: any) => {
            const assigneeId = sfdcManager.caseSafeId(record.AssigneeId);
            const permissionSetId = sfdcManager.caseSafeId(record.PermissionSetId);
            const user = users.get(assigneeId);
            if (user) {
                // Add permission set id to the user (only persets or PSGs)
                if (record.PermissionSet?.IsOwnedByProfile === false) {
                    // IsOwnedByProfile === false means it's a PermSet or PSG (not a Profile)
                    user.permissionSetIds.push(permissionSetId);
                }
                // Check for admin-like permissions for this user via this Permission Set / PSG / Profile
                if (record.PermissionSet?.PermissionsModifyAllData === true ||
                    record.PermissionSet?.PermissionsViewAllData === true ||
                    record.PermissionSet?.PermissionsManageUsers === true ||
                    record.PermissionSet?.PermissionsCustomizeApplication === true) {
                    user.isAdminLike = true;                    
                }
                // Check user has MFA bypass via this Permission Set / PSG / Profile
                if (record.PermissionSet?.PermissionsBypassMFAForUiLogins === true) {
                    user.hasMfaByPass = true;
                }
            }
        });

        // Now process the user logins aggregates
        logger?.log(`Parsing ${loginRecords?.length} user logins aggregates...`);
        await Processor.forEach(loginRecords, async (/** @type {any} */ record: any) => {

            // Only successful logins are interesting
            if (record.Status === 'Success') { // filter not possible in SOQL!
                const userId = sfdcManager.caseSafeId(record.UserId);
                const user = users.get(userId);
                if (user) {
                    // depending on the login access (direct or sso)
                    if (record.LoginType === 'Application') {
                        // Direct login access via browser
                        user.nbDirectLogins += record.CntLogins;
                    } else {
                        // SSO login access via IDP
                        user.nbSSOLogins += record.CntLogins;
                    }
                }
            }
        });

        // Now process the user verifications aggregates
        logger?.log(`Parsing ${verifRecords?.length} user verifications aggregates...`);
        await Processor.forEach(verifRecords, async (/** @type {any} */ record: any) => {

            const userId = sfdcManager.caseSafeId(record.UserId);
            const user = users.get(userId);
            if (user) {
                // If MFA is used for internal logins
                if (record.Policy === 'TwoFactorAuthentication') {
                    user.nbDirectLoginsWithMFA += record.CntVerifications;
                } else {
                    user.nbDirectLoginsWithoutMFA += record.CntVerifications;
                }
            }
        });

        // FINALLY!!!! Compute the score of all items
        logger?.log(`Computing scores for ${users.size} users...`);
        await Processor.forEach(users, async (/** @type {SFDC_User} */ user: SFDC_User) => {
            userDataFactory.computeScore(user);
        });

        // Return data as map
        logger?.log(`Done`);
        return users;
    } 
}