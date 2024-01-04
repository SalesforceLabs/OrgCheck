import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_PermissionSet extends OrgCheckData {
    id;
    url;
    name;
    apiName;
    description;
    license;
    isCustom;
    package;
    memberCounts;
    isGroup;
    createdDate;
    lastModifiedDate;
    nbFieldPermissions;
    nbObjectPermissions;
    profileIds;
    profileRefs;

    constructor(setup) {
        super();
        super.initData(setup);
    }
}