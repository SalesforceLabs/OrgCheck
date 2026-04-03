import { DataAliases } from 'src/api/core/data/orgcheck-api-data-aliases';
import { DataWithScore } from 'src/api/core/data/orgcheck-api-data';
import { SfdcPermissionSet } from 'src/api/data/orgcheck-api-data-permissionset';
import { SfdcProfile } from 'src/api/data/orgcheck-api-data-profile';

export interface SfdcUser extends DataWithScore {
    
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SfdcUser;

     /**
     * @description Salesforce Id
     * @type {string}
     * @public
     */
    id: string;
    
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url: string;
    
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name: string;
    
    /**
     * @description Datetime of the last login of that user. Undefined if never logged in.
     * @type {number}
     * @public
     */
    lastLogin: number;

    /**
     * @description Number of failed logins
     * @type {number}
     * @public
     */
    numberFailedLogins: number;
    
    /**
     * @description Is this user on the Lightning Experience?
     * @type {boolean}
     * @public
     */
    onLightningExperience: boolean;

    /**
     * @description When this user changed its password for the last time. Undefined if never changed.
     * @type {number}
     * @public
     */
    lastPasswordChange: number;

    /**
     * @description Profile salesforce id of this user
     * @type {string}
     * @public
     */
    profileId: string;

    /**
     * @description Crresponding Profile reference used by this user
     * @type {SfdcProfile}
     * @public
     */
    profileRef: SfdcProfile;

    /**
     * @description Set of sensible system permissions granted to this users (like view all etc.)
     * @type {{apiEnabled: boolean, viewSetup: boolean, modifyAllData: boolean, viewAllData: boolean, manageUsers: boolean, customizeApplication: boolean}}
     * @public
     */
    importantPermissions: { apiEnabled: boolean; viewSetup: boolean; modifyAllData: boolean; viewAllData: boolean; manageUsers: boolean; customizeApplication: boolean; };

    /**
     * @description Set of sensible system permissions along with the Profile or PermSet that grants them to this users (like view all etc.)
     * @type {{apiEnabled: SfdcProfile[], viewSetup: SfdcProfile[], modifyAllData: SfdcProfile[], viewAllData: SfdcProfile[], manageUsers: SfdcProfile[], customizeApplication: SfdcProfile[]}}
     * @public
     */
    importantPermissionsGrantedBy: { apiEnabled: SfdcProfile[]; viewSetup: SfdcProfile[]; modifyAllData: SfdcProfile[]; viewAllData: SfdcProfile[]; manageUsers: SfdcProfile[]; customizeApplication: SfdcProfile[]; };

    /**
     * @description Is this user admin-like (has some powerful permissions)
     * @type {boolean}
     * @public
     */
    isAdminLike: boolean;

    /**
     * @description Does this user have MFA bypass activated
     * @type {boolean}
     * @public
     */
    hasMfaByPass: boolean;

    /**
     * @description Does this user have debug mode activated
     * @type {boolean}
     * @public
     */
    hasDebugMode: boolean;

    /**
     * @description List of permission set ids assigned to this user
     * @type {string[]}
     * @public
     */
    permissionSetIds: string[];

    /**
     * @description List of permission set references assigned to this user
     * @type {SfdcPermissionSet[]}
     * @public
     */
    permissionSetRefs: SfdcPermissionSet[];

    /**
     * @description Number of direct logins to salesforce
     * @type {number}
     * @public
     */
    nbDirectLogins: number;

    /**
     * @description Number of direct logins without using MFA
     * @type {number}
     * @public
     */
    nbDirectLoginsWithoutMFA: number;

    /**
     * @description Number of direct logins with using MFA
     * @type {number}
     * @public
     */
    nbDirectLoginsWithMFA: number;

    /**
     * @description Number of indirect logins via SSO
     * @type {number}
     * @public
     */
    nbSSOLogins: number;
}