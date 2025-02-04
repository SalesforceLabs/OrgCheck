import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_ValidationRule extends OrgCheckData {
    
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
    id;
    
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name;
    
    /**
     * @description Is this item active or not?
     * @type {boolean}
     * @public
     */
    isActive;
    
    /**
     * @description Full description of that item
     * @type {string}
     * @public
     */
    description;
    errorDisplayField;
    errorMessage;
    
    /**
     * @description Salesforce Id of the sObject where this field is defined
     * @type {string}
     * @public
     */
    objectId; 

    objectRef;

    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url;
}