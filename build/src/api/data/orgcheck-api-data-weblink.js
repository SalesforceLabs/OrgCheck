import { Data } from '../core/orgcheck-api-data';

export class SFDC_WebLink extends Data {
    
    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Web Link' };

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
     * @description Number of hard coded Salesforce URLs in the formula
     * @type {number}
     * @public
     */
    nbHardCodedURLs;

    /**
     * @description Number of hard coded Salesforce IDs in the formula
     * @type {number}
     * @public
     */
    nbHardCodedIDs;
    
    /**
     * @description Type of the link
     * @type {string}
     * @public
     */
    type;
    
    /**
     * @description Behavior of the link
     * @type {string}
     * @public
     */
    behavior;

    /**
     * @description Name of the potential namespace/package where this item comes from. Empty string if none.
     * @type {string}
     * @public
     */
    package;

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