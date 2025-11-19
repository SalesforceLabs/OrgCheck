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
     * @description List of sensible system permissions for this users (like view all etc.)
     * @type {any}
     * @public
     */
    aggregateImportantPermissions;

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
     * @description Number of direct login without using MFA
     * @type {number}
     * @public
     */
    nbDirectLoginWithoutMFA;

    /**
     * @description Number of direct login with using MFA
     * @type {number}
     * @public
     */
    nbDirectLoginWithMFA;

    /**
     * @description Number of indirect login via SSO
     * @type {number}
     * @public
     */
    nbSSOLogin;
}