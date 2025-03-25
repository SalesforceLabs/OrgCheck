import { DataWithDependencies } from '../core/orgcheck-api-data';
import { SFDC_Object } from './orgcheck-api-data-object';

/**
 * @description Representation of a Lightning Page in Org Check
 */
export class SFDC_LightningPage extends DataWithDependencies {
    
    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Lightning Page' };

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
     * @description Type of the Lightning Page
     * @type {string}
     * @public
     */
    type;
    
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
     * @description Identifier of the related object for this page (if any)
     * @type {string}
     * @public
     */
    objectId; 
    
    /**
     * @description Reference of the related object for this page (if any)
     * @type {SFDC_Object}
     * @public
     */
    objectRef;

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