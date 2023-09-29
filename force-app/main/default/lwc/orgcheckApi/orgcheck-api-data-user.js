export class SFDC_User {
    id;
    url;
    photoUrl;
    name;
    lastLogin;
    neverLogged;
    numberFailedLogins;
    onLightningExperience;
    lastPasswordChange;
    profileId;
    profileRef;
    importantPermissions;
    permissionSetIds;
    permissionSetRefs;
    constructor(setup) { MAP_FIELDS_FROM_SETUP(setup, this, true); }
}