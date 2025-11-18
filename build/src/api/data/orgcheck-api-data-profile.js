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
     * @description Full description of that item
     * @type {string}
     * @public
     */
    description;

    /**
     * @description License type of this item
     * @type {string}
     * @public
     */
    license;

    /**
     * @description Whether this item is a custom item
     * @type {boolean}
     * @public
     */
    isCustom;
    
    /**
     * @description Name of the potential namespace/package where this item comes from. Empty string if none.
     * @type {string}
     * @public
     */
    package;

    /**
     * @description Number of users assigned to this profile
     * @type {number}
     * @public
     */
    memberCounts;
    
    /**
     * @description Date/Time when this item was created in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    createdDate;
    
    /**
     * @description Date/Time when this item was last modified in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastModifiedDate;

    /**
     * @description Number of field permissions
     * @type {number}
     * @public
     */
    nbFieldPermissions;

    /**
     * @description Number of object permissions
     * @type {number}
     * @public
     */
    nbObjectPermissions;

    /**
     * @description Type of this item
     * @type {number}
     * @public
     */
    type;

    /**
     * @description Number of sensitive system permissions in this profile (like view all data etc..)
     * @type {any}
     * @public
     */
    importantPermissions;

    /**
     * @description True if this profile is admin-like (has some powerful permissions)
     * @type {boolean}
     * @public
     */
    isAdminLike;
}