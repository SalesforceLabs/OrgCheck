import { DataWithDependencies } from '../core/orgcheck-api-data';

export class SFDC_StaticResource extends DataWithDependencies {
    
    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Static Resource' };

    /**
     * @description Salesforce Id
     * @type {string}
     * @public
     */
    id;
    
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name;
    
    /**
     * @description Name of the potential namespace/package where this item comes from. Empty string if none.
     * @type {string}
     * @public
     */
    package;
    
    /**
     * @description Content type of this item
     * @type {string}
     * @public
     */
    contentType;
    
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
     * @description Full description of that item
     * @type {string}
     * @public
     */
    description;
    
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url;
}