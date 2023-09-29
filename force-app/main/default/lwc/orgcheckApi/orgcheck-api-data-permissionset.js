export class SFDC_PermissionSet {
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
    constructor(setup) { MAP_FIELDS_FROM_SETUP(setup, this, true); }
}