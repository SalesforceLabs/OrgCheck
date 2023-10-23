import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_Group extends OrgCheckData {
    id;
    url;
    name;
    developerName;
    includeBosses;
    relatedId;
    directUsers;
    directGroups;
    indirectUsers;
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