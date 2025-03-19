import { DataWithDependencies } from '../core/orgcheck-api-data';

export class SFDC_VisualForcePage extends DataWithDependencies {
    
    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Visualforce Page' };

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
     * @description API Version (as a number) set in the metadata for this item.
     * @type {number}
     * @public
     */
    apiVersion;

    /**
     * @description Number of hard coded Salesforce URLs
     * @type {number}
     * @public
     */
    nbHardCodedURLs;

    /**
     * @description Number of hard coded Salesforce IDs
     * @type {number}
     * @public
     */
    nbHardCodedIDs;

    /**
     * @description Is this page ready for mobile?
     * @type {boolean}
     * @public
     */ 
    isMobileReady;
    
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