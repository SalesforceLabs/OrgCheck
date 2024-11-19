import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';
import { TYPE_USER } from '../core/orgcheck-api-sfconnectionmanager';
import { SFDC_User } from '../data/orgcheck-api-data-user';

export class OrgCheckDatasetUsers extends OrgCheckDataset {

    async run(sfdcManager, dataFactory, localLogger) {

        // First SOQL query
        localLogger.log(`Querying REST API about internal active User in the org...`);            
        const results = await sfdcManager.soqlQuery([{ 
            string: 'SELECT Id, Name, SmallPhotoUrl, ProfileId, '+
            'LastLoginDate, LastPasswordChangeDate, NumberOfFailedLogins, '+
            'UserPreferencesLightningExperiencePreferred, '+
            '(SELECT PermissionSetId FROM PermissionSetAssignments WHERE PermissionSet.IsOwnedByProfile = false) '+
            'FROM User '+
            'WHERE IsActive = true ' + // we only want active users
            'AND ContactId = NULL ' + // only internal users
            'AND Profile.Id != NULL ' // we do not want the Automated Process users!
        }], localLogger);

        // Init the factory and records
        const userDataFactory = dataFactory.getInstance(SFDC_User);

        // Create the map
        const userRecords = results[0].records;
        localLogger.log(`Parsing ${userRecords.length} users...`);
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
                    url: sfdcManager.setupUrl(id, TYPE_USER)
                }
            });

            // Add it to the map  
            return [ user.id, user ];
        }));

        // Return data as map
        localLogger.log(`Done`);
        return users;
    } 
}