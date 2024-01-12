import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_UserRole extends OrgCheckData {

    id;
    name;
    apiname;
    url;
    parentId;
    parentRef;
    hasParent;
    activeMembersCount;
    activeMemberIds;
    activeMemberRefs;
    hasActiveMembers;
    inactiveMembersCount;
    hasInactiveMembers;
    isExternal;

    constructor(setup) {
        super();
        super.initData(setup);
    }
}