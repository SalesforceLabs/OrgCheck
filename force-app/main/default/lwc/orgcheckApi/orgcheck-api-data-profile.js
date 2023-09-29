export class SFDC_Profile {
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
    constructor(setup) { MAP_FIELDS_FROM_SETUP(setup, this, true); }
}