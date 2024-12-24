// @ts-check

import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_User extends OrgCheckData {
    
    /**
     * @description Salesforce Id
     * @type {string}
     * @public
     */
    id;
    
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url;
    photoUrl;
    
    /**
     * @description Name
     * @type {string}
     * @public
     */
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