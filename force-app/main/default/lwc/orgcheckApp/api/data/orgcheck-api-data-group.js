import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_Group extends OrgCheckData {
    id;
    url;
    name;
    developerName;
    includeBosses;
    relatedId;
    nbDirectMembers;
    directUserIds;
    directUserRefs;
    directGroupIds;
    directGroupRefs;
    nbIndirectUsers;
    nbUsers;
    indirectUserIds;
    indirectUserRefs;
    isPublicGroup;
    isQueue;
    isRole;
    isRoleAndSubordinates;
    isTechnical;
}