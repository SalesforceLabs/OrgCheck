import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { SFDC_Group } from '../data/orgcheck-api-data-group';

export class OrgCheckDatasetGroups extends OrgCheckDataset {

    run(sfdcManager, localLogger, resolve, reject) {

        // SOQL query on CustomField
        sfdcManager.soqlQuery([{ 
            string: 'SELECT Id, Name, DeveloperName, DoesIncludeBosses, Type, RelatedId, Related.Name, '+
                        '(SELECT UserOrGroupId From GroupMembers)'+
                    'FROM Group '
        }]).then((results) => {

            // Init the map
            const groups = new Map();

            // Set the map
            localLogger.log(`Parsing ${results[0].records.length} Groups...`);
            results[0].records
                .forEach((record) => {

                    // Get the ID15 of this custom field
                    const id = sfdcManager.caseSafeId(record.Id);

                    // Create the instance (common one)
                    let group = new SFDC_Group({
                        id: id,
                        isPublicGroup: record.Type === 'Regular',
                        isQueue: record.Type === 'Queue',
                        isRole: record.Type === 'Role',
                        isRoleAndSubordinates: record.Type === 'RoleAndSubordinates'
                    });
                    // Depending on the type we add some properties
                    switch (record.Type) {
                        case 'Regular': 
                        case 'Queue': {
                            group.url = sfdcManager.setupUrl('public-group', record.Id);
                            group.name = record.Name;
                            group.developerName = record.DeveloperName;
                            group.includeBosses = record.DoesIncludeBosses;
                            group.isTechnical = false;
                            break;
                        }
                        case 'Role':
                        case 'RoleAndSubordinates': {
                            group.url = sfdcManager.setupUrl('role', record.RelatedId);
                            group.name = record.Related.Name;
                            group.relatedId = sfdcManager.caseSafeId(record.RelatedId);
                            group.isTechnical = false;
                            break;
                        }
                        // case 'AllCustomerPortal':
                        // case 'Organization':
                        // case 'PRMOrganization':
                        default: {
                            group.name = record.Type;
                            group.isTechnical = true;
                            break;
                        }
                    }

                    // Handle the group membership
                    if (record.GroupMembers && record.GroupMembers.records && record.GroupMembers.records.length > 0) {
                        group.directUsers = [];
                        group.directGroups = [];
                        record.GroupMembers.records.forEach((m) => {
                            const groupMemberId = sfdcManager.caseSafeId(m.UserOrGroupId);
                            (groupMemberId.startsWith('005') ? group.directUsers : group.directGroups).push({ id: groupMemberId, url: '/' });
                        });
                    }
 
                    // Add it to the map  
                    groups.set(group.id, group);
                });

            // Return data
            resolve(groups);
        }).catch(reject);
    } 
}