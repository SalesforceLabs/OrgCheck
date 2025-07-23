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
     * @description Is this permission is assigned to at least on permission set group that has at least one active member
     * @type {boolean}
     * @public
     */
    assignedToNonEmptyGroup;
}