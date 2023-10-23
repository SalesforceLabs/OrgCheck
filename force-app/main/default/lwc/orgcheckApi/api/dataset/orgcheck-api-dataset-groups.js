import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { OrgCheckMap } from '../core/orgcheck-api-type-map';
import { SFDC_Group } from '../data/orgcheck-api-data-group';

export class OrgCheckDatasetGroups extends OrgCheckDataset {

    run(sfdcManager, resolve, reject) {

        // SOQL query on CustomField
        sfdcManager.soqlQuery([{ 
            string: 'SELECT Id, Name, DeveloperName, DoesIncludeBosses, Type, RelatedId, Related.Name, '+
                        '(SELECT UserOrGroupId From GroupMembers)'+
                    'FROM Group '
        }]).then((results) => {

            // Init the map
            const groups = new OrgCheckMap();

            // Set the map
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
                        isRoleAndSubordinates: record.Type === 'RoleAndSubordinates',
                        directUsers: [],
                        directGroups: [],
                        indirectUsers: []
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
                    if (record.GroupMembers && record.GroupMembers.records) {
                        record.GroupMembers.records.forEach((m) => {
                            const memberId = sfdcManager.caseSafeId(m.UserOrGroupId);
                            (memberId.startsWith('005') ? group.directUsers : group.directGroups).push({ id: memberId });
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