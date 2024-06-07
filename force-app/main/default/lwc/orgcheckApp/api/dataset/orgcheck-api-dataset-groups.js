import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { SFDC_Group } from '../data/orgcheck-api-data-group';

const RECURSIVE_INDIRECT_USERS = (groups, groupId, returnSomething) => {
    if (groups.has(groupId) === false) {
        return [];
    }
    const group = groups.get(groupId);
    if (group.directGroupIds?.length > 0) {
        const indirectUserIds = new Set();
        group.directGroupIds.forEach((subGroupId) => {
            RECURSIVE_INDIRECT_USERS(groups, subGroupId, true).forEach((u) => indirectUserIds.add(u));
        });
        group.indirectUserIds = Array.from(indirectUserIds);
    }
    if (returnSomething === true) {
        const allUserIds = new Set();
        group.directUserIds?.forEach((u) => allUserIds.add(u));
        group.indirectUserIds?.forEach((u) => allUserIds.add(u));
        return Array.from(allUserIds);
    }
    return [];
}

export class OrgCheckDatasetGroups extends OrgCheckDataset {

    async run(sfdcManager, dataFactory, localLogger) {

        // First SOQL query
        localLogger.log(`Querying REST API about Group in the org...`);            
        const results = await sfdcManager.soqlQuery([{ 
            string: 'SELECT Id, Name, DeveloperName, DoesIncludeBosses, Type, RelatedId, Related.Name, '+
                        '(SELECT UserOrGroupId From GroupMembers)'+
                    'FROM Group '
        }], localLogger);

        // Init the factory and records
        const groupDataFactory = dataFactory.getInstance(SFDC_Group);

        // Create the map
        localLogger.log(`Parsing ${results[0].records.length} groups...`);
        const groups = new Map(results[0].records.map((record) => {
        
            // Get the ID15 of this custom field
            const id = sfdcManager.caseSafeId(record.Id);

            // Create the instance (common one)
            const group = groupDataFactory.create({
                id: id,
                isPublicGroup: record.Type === 'Regular',
                isQueue: record.Type === 'Queue',
                isRole: record.Type === 'Role',
                isRoleAndSubordinates: record.Type === 'RoleAndSubordinates',
                nbDirectMembers: 0,
                nbIndirectMembers: 0
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
                group.nbDirectMembers = group.directUserIds.length + group.directGroupIds.length;
            }

            // Add it to the map  
            return [ group.id, group ];
        }));

        // Handle the indirect group membership
        localLogger.log(`Computing the indirect group memberships for ${groups.size} groups ...`);
        groups.forEach((group) => {
            RECURSIVE_INDIRECT_USERS(groups, group.id, false);
            group.nbIndirectUsers = group.indirectUserIds?.length || 0;
            group.nbUsers = group.nbIndirectUsers + (group.directUserIds?.length || 0);

            // Compute the score of this item
            groupDataFactory.computeScore(group);
        });

        // Return data as map
        localLogger.log(`Done`);
        return groups;
    } 
}