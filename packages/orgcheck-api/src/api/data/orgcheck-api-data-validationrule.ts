import { Data } from '../core/orgcheck-api-data';
import { SFDC_Object } from './orgcheck-api-data-object';

export class SFDC_ValidationRule extends Data {
    
    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Validation Rule' };

    /**
     * @description Salesforce Id
     * @type {string}
     * @public
     */
    id: string;
    
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name: string;
    
    /**
     * @description Is this item active or not?
     * @type {boolean}
     * @public
     */
    isActive: boolean;
    
    /**
     * @description Full description of that item
     * @type {string}
     * @public
     */
    description: string;

    /**
     * @description Field where to show the error message if any
     * @type {string}
     * @public
     */
    errorDisplayField: string;

    /**
     * @description Error message
     * @type {string}
     * @public
     */
    errorMessage: string;
    
    /**
     * @description Salesforce Id of the sObject where this field is defined
     * @type {string}
     * @public
     */
    objectId: string; 

    /**
     * @description Reference of the object for this rule
     * @type {SFDC_Object}
     * @public
     */
    objectRef: SFDC_Object;

    /**
     * @description Name of the potential namespace/package where this item comes from. Empty string if none.
     * @type {string}
     * @public
     */
    package: string;

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
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url: string;
}