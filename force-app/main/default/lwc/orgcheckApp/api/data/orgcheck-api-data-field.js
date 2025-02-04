import { OrgCheckDataWithDependencies } from '../core/orgcheck-api-data';

/**
 * @description Representation of a Standard Field or a Custom Field in Org Check
 */
export class SFDC_Field extends OrgCheckDataWithDependencies {
    
    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Standard or Custom Field' };

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
    
    label;
    
    /**
     * @description Name of the potential namespace/package where this item comes from. Empty string if none.
     * @type {string}
     * @public
     */
    package;
    
    /**
     * @description Full description of that item
     * @type {string}
     * @public
     */
    description;
    
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
     * @description Salesforce Id of the sObject where this field is defined
     * @type {string}
     * @public
     */
    objectId; 

    objectRef;

    isCustom;

    /**
     * @description Tooltip
     * @type {string}
     * @public
     */
    tooltip;

    type;

    length;

    isUnique;

    isEncrypted;

    isExternalId;

    isIndexed;

    /**
     * @description Default value
     * @type {string}
     * @public
     */
    defaultValue;

    formula;
}