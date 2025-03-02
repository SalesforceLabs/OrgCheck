import { Data } from '../core/orgcheck-api-data';

export class SFDC_User extends Data {
    
    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'User' };

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