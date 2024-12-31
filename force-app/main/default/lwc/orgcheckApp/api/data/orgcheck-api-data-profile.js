import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_Profile extends OrgCheckData {
    
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
    
    apiName;
    
    /**
     * @description Full description of that item
     * @type {string}
     * @public
     */
    description;
    license;
    isCustom;
    
    /**
     * @description Name of the potential namespace/package where this item comes from. Empty string if none.
     * @type {string}
     * @public
     */
    package;
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
    nbFieldPermissions;
    nbObjectPermissions;
    type;
    importantPermissions;
}