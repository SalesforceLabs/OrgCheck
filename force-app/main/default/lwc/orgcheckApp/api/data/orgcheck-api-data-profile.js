import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_Profile extends OrgCheckData {
    id;
    url;
    name;
    apiName;
    description;
    license;
    isCustom;
    package;
    memberCounts;
    createdDate;
    lastModifiedDate;
    nbFieldPermissions;
    nbObjectPermissions;
    type;

    constructor(setup) {
        super();
        setup.type = 'Profile';
        super.initData(setup);
    }
}