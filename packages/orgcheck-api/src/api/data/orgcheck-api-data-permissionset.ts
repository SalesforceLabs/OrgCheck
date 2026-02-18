import { DataWithScore } from '../core/orgcheck-api-data';
import { DataAliases } from '../core/orgcheck-api-data-aliases';

export interface SFDC_PermissionSet extends DataWithScore {

    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_PermissionSet;
            
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
     * @description Full description of that item
     * @type {string}
     * @public
     */
    description: string;

    /**
     * @description License type of this item
     * @type {string}
     * @public
     */
    license: string;

    /**
     * @description Whether this item is a custom item
     * @type {boolean}
     * @public
     */
    isCustom: boolean;
    
    /**
     * @description Name of the potential namespace/package where this item comes from. Empty string if none.
     * @type {string}
     * @public
     */
    package: string;

    /**
     * @description Number of users assigned to this permission set
     * @type {number}
     * @public
     */
    memberCounts: number;
    
    /**
     * @description Date/Time when this item was created in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    createdDate: number;
    
    /**
     * @description Date/Time when this item was last modified in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastModifiedDate: number;

    /**
     * @description Number of field permissions
     * @type {number}
     * @public
     */
    nbFieldPermissions: number;

    /**
     * @description Number of object permissions
     * @type {number}
     * @public
     */
    nbObjectPermissions: number;

    /**
     * @description Type of this item
     * @type {number}
     * @public
     */
    type: number;

    /**
     * @description Number of sensitive system permissions in this permission set (like view all data etc..)
     * @type {{apiEnabled: boolean, viewSetup: boolean, modifyAllData: boolean, viewAllData: boolean, manageUsers: boolean, customizeApplication: boolean}}
     * @public
     */
    importantPermissions: { apiEnabled: boolean; viewSetup: boolean; modifyAllData: boolean; viewAllData: boolean; manageUsers: boolean; customizeApplication: boolean; };

    /**
     * @description True if this permission set is admin-like (has some powerful permissions)
     * @type {boolean}
     * @public
     */
    isAdminLike: boolean;

     /**
     * @description Is this a Permission Set Group
     * @type {boolean}
     * @public
     */
    isGroup: boolean;

    /**
     * @description Corresponding Permission Set Group Salesforce Id, if this item is a Permission Set Group
     * @type {string}
     * @public
     */
    groupId: string;

    /**
     * @description True if all the permission set groups including this permission set are empty
     * @type {boolean}
     * @public
     */
    allIncludingGroupsAreEmpty: boolean;

    /**
     * @description List of permission set Salesforce Ids associated with the current group (if it's a group!)
     * @type {Array<string>}
     * @public
     */
    permissionSetIds: Array<string>;

    /**
     * @description Corresponding references of the permission sets associated with the current group (if it's a group!)
     * @type {Array<SFDC_PermissionSet>}
     * @public
     */
    permissionSetRefs: Array<SFDC_PermissionSet>;

    /**
     * @description List of permission set group Salesforce Ids that include the current permission set (if it's NOT a group!)
     * @type {Array<string>}
     * @public
     */
    permissionSetGroupIds: Array<string>;

    /**
     * @description Corresponding references of the permission set groups that include the current permission set (if it's NOT a group!)
     * @type {Array<SFDC_PermissionSet>}
     * @public
     */
    permissionSetGroupRefs: Array<SFDC_PermissionSet>;
}