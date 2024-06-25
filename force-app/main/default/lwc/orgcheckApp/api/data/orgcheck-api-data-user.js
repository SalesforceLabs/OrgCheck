import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_User extends OrgCheckData {
    id;
    url;
    photoUrl;
    name;
    lastLogin;
    numberFailedLogins;
    onLightningExperience;
    lastPasswordChange;
    profileId;
    profileRef;
    aggregateImportantPermissions;
    permissionSetIds;
    permissionSetRefs;
}