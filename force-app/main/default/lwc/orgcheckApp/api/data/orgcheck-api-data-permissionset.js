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
    type;

    constructor(setup) {
        super();
        if (setup.isGroup === true) {
            setup.type = 'Permission Set Group';
        } else {
            setup.type = 'Permission Set';
        }
        super.initData(setup);
    }
}