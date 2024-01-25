import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_Group extends OrgCheckData {
    id;
    url;
    name;
    developerName;
    includeBosses;
    relatedId;
    directUserIds;
    directUserRefs;
    directGroupIds;
    directGroupRefs;
    indirectUserIds;
    indirectUserRefs;
    isPublicGroup;
    isQueue;
    isRole;
    isRoleAndSubordinates;
    isTechnical;

    constructor(setup) {
        super();
        super.initData(setup);
    }
}