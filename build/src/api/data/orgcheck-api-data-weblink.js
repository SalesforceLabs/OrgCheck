import { DataWithDependencies } from '../core/orgcheck-api-data';
import { SFDC_Object } from './orgcheck-api-data-object';

export class SFDC_WebLink extends DataWithDependencies {
    
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
     * @description Unique list of hard coded Salesforce URLs in this item
     * @type {Array<string>}
     * @public
     */
    hardCodedURLs;

    /**
     * @description Unique list of hard coded Salesforce IDs in this item
     * @type {Array<string>}
     * @public
     */
    hardCodedIDs;
    
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

    /**
     * @description Identifier of the object for this trigger
     * @type {string}
     * @public
     */
    objectId; 
    
    /**
     * @description Reference of the object for this trigger
     * @type {SFDC_Object}
     * @public
     */
    objectRef;
}