import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_User extends OrgCheckData {
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
}