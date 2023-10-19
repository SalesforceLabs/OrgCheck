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

                    // Dependending on type we create a different instance
                    let group = undefined;
                    switch (record.Type) {
                        case 'Regular': 
                        case 'Queue': {
                            group = new SFDC_Group({
                                id: id,
                                url: sfdcManager.setupUrl('public-group', record.Id),
                                name: record.Name,
                                developerName: record.DeveloperName,
                                includeBosses: record.DoesIncludeBosses,
                                isPublicGroup: record.Type === 'Regular',
                                isQueue: record.Type = 'Queue',
                                directUsers: [],
                                directGroups: [],
                                indirectUsers: []
                            });
                            break;
                        }
                        case 'Role':
                        case 'RoleAndSubordinates': {
                            group = new SFDC_Group({
                                id: id,
                                relatedId: sfdcManager.caseSafeId(record.RelatedId),
                                name: record.Related.Name,
                                directUsers: [],
                                directGroups: [],
                                indirectUsers: []
                            });
                            break;
                        }
                        default: {
                            console.error(record);
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