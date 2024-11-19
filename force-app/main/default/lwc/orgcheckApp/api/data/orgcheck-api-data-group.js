import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_Group extends OrgCheckData {
    id;
    url;
    name;
    developerName;
    includeBosses;
    includeSubordinates;
    relatedId;
    nbDirectMembers;
    directUserIds;
    directUserRefs;
    directGroupIds;
    directGroupRefs;
    isPublicGroup;
    isQueue;
    type;
}