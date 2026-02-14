import { Data } from '../core/orgcheck-api-data';

export class SFDC_Profile extends Data {
    
    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Profile' };

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
     * @description Number of users assigned to this profile
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
     * @description Number of sensitive system permissions in this profile (like view all data etc..)
     * @type {{apiEnabled: boolean, viewSetup: boolean, modifyAllData: boolean, viewAllData: boolean, manageUsers: boolean, customizeApplication: boolean}}
     * @public
     */
    importantPermissions: { apiEnabled: boolean; viewSetup: boolean; modifyAllData: boolean; viewAllData: boolean; manageUsers: boolean; customizeApplication: boolean; };

    /**
     * @description True if this profile is admin-like (has some powerful permissions)
     * @type {boolean}
     * @public
     */
    isAdminLike: boolean;
}