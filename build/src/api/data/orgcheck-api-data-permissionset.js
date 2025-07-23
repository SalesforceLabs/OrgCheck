import { SFDC_Profile } from './orgcheck-api-data-profile';

export class SFDC_PermissionSet extends SFDC_Profile {

    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Permission Set or Permission Set Group' };

    /**
     * @description Is this a Permission Set Group
     * @type {boolean}
     * @public
     */
    isGroup;

    /**
     * @description Corresponding Permission Set Group Salesforce Id, if this item is a Permission Set Group
     * @type {string}
     * @public
     */
    groupId;

    /**
     * @description True if all the permission set groups including this permission set are empty
     * @type {boolean}
     * @public
     */
    allIncludingGroupsAreEmpty;

    /**
     * @description List of permission set Salesforce Ids associated with the current group (if it's a group!)
     * @type {Array<string>}
     * @public
     */
    permissionSetIds;

    /**
     * @description Corresponding references of the permission sets associated with the current group (if it's a group!)
     * @type {Array<SFDC_PermissionSet>}
     * @public
     */
    permissionSetRefs;

    /**
     * @description List of permission set group Salesforce Ids that include the current permission set (if it's NOT a group!)
     * @type {Array<string>}
     * @public
     */
    permissionSetGroupIds;

    /**
     * @description Corresponding references of the permission set groups that include the current permission set (if it's NOT a group!)
     * @type {Array<SFDC_PermissionSet>}
     * @public
     */
    permissionSetGroupRefs;
}