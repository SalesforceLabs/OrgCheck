import { Data } from '../core/orgcheck-api-data';
import { SFDC_PermissionSet } from './orgcheck-api-data-permissionset';
import { SFDC_Profile } from './orgcheck-api-data-profile';

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
    
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name;
    
    /**
     * @description Datetime of the last login of that user. Undefined if never logged in.
     * @type {number}
     * @public
     */
    lastLogin;

    /**
     * @description Number of failed logins
     * @type {number}
     * @public
     */
    numberFailedLogins;
    
    /**
     * @description Is this user on the Lightning Experience?
     * @type {boolean}
     * @public
     */
    onLightningExperience;

    /**
     * @description When this user changed its password for the last time. Undefined if never changed.
     * @type {number}
     * @public
     */
    lastPasswordChange;

    /**
     * @description Profile salesforce id of this user
     * @type {string}
     * @public
     */
    profileId;

    /**
     * @description Crresponding Profile reference used by this user
     * @type {SFDC_Profile}
     * @public
     */
    profileRef;

    /**
     * @description Set of sensible system permissions granted to this users (like view all etc.)
     * @type {{apiEnabled: boolean, viewSetup: boolean, modifyAllData: boolean, viewAllData: boolean, manageUsers: boolean, customizeApplication: boolean}}
     * @public
     */
    importantPermissions;

    /**
     * @description Set of sensible system permissions along with the Profile or PermSet that grants them to this users (like view all etc.)
     * @type {{apiEnabled: Array<SFDC_Profile>, viewSetup: Array<SFDC_Profile>, modifyAllData: Array<SFDC_Profile>, viewAllData: Array<SFDC_Profile>, manageUsers: Array<SFDC_Profile>, customizeApplication: Array<SFDC_Profile>}}
     * @public
     */
    importantPermissionsGrantedBy;

    /**
     * @description Is this user admin-like (has some powerful permissions)
     * @type {boolean}
     * @public
     */
    isAdminLike;

    /**
     * @description Does this user have MFA bypass activated
     * @type {boolean}
     * @public
     */
    hasMfaByPass;

    /**
     * @description Does this user have debug mode activated
     * @type {boolean}
     * @public
     */
    hasDebugMode;

    /**
     * @description List of permission set ids assigned to this user
     * @type {Array<string>}
     * @public
     */
    permissionSetIds;

    /**
     * @description List of permission set references assigned to this user
     * @type {Array<SFDC_PermissionSet>}
     * @public
     */
    permissionSetRefs;

    /**
     * @description Number of direct logins to salesforce
     * @type {number}
     * @public
     */
    nbDirectLogins;

    /**
     * @description Number of direct logins without using MFA
     * @type {number}
     * @public
     */
    nbDirectLoginsWithoutMFA;

    /**
     * @description Number of direct logins with using MFA
     * @type {number}
     * @public
     */
    nbDirectLoginsWithMFA;

    /**
     * @description Number of indirect logins via SSO
     * @type {number}
     * @public
     */
    nbSSOLogins;
}