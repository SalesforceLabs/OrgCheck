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

                    // Handle the direct group membership
                    if (record.GroupMembers && record.GroupMembers.records && record.GroupMembers.records.length > 0) {
                        group.directUserIds = [];
                        group.directGroupIds = [];
                        record.GroupMembers.records.forEach((m) => {
                            const groupMemberId = sfdcManager.caseSafeId(m.UserOrGroupId);
                            (groupMemberId.startsWith('005') ? group.directUserIds : group.directGroupIds).push(groupMemberId);
                        });
                    }
 
                    // Add it to the map  
                    groups.set(group.id, group);
                });

            // Handle the indirect group membership
            localLogger.log(`Computing the indirect group memberships for ${groups.size} groups ...`);
            groups.forEach((group) => RECURSIVE_INDIRECT_USERS(groups, group.id, false));

            // Return data
            resolve(groups);
        }).catch(reject);
    } 
}

const RECURSIVE_INDIRECT_USERS = (groups, groupId, returnSomething) => {
    if (groups.has(groupId) === false) {
        console.error('id not found', groupId, groups);
        return [];
    }
    const group = groups.get(groupId);
    if (group.directGroupIds?.length > 0) {
        group.indirectUserIds = [];
        group.directGroupIds.forEach((subGroupId) => {
            RECURSIVE_INDIRECT_USERS(groups, subGroupId, true).forEach((u) => group.indirectUserIds.push(u));
        });
    }
    if (returnSomething === true) {
        const array = [];
        group.directUserIds?.forEach((u) => array.push(u));
        group.indirectUserIds?.forEach((u) => array.push(u));
        return array;
    }
}