import { OrgCheckDataWithDependencies } from '../core/orgcheck-api-data';

/**
 * @description Representation of a Custom Label in Org Check
 */
export class SFDC_CustomLabel extends OrgCheckDataWithDependencies {
    
    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Custom Label' };

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
     * @description Label
     * @type {string}
     * @public
     */
    label;

    /**
     * @description Category
     * @type {string}
     * @public
     */
    category;

    isProtected;

    /**
     * @description Language code for the label
     * @type {string}
     * @public
     */
    language;

    /**
     * @description Value
     * @type {string}
     * @public
     */
    value;
    
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url;
    
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
}