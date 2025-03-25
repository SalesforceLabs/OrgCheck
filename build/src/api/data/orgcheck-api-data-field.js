import { DataWithDependencies } from '../core/orgcheck-api-data';
import { SFDC_Object } from './orgcheck-api-data-object';

/**
 * @description Representation of a Standard Field or a Custom Field in Org Check
 */
export class SFDC_Field extends DataWithDependencies {
    
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
    
    /**
     * @description Label
     * @type {string}
     * @public
     */
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

    /**
     * @description Reference of the object for this field
     * @type {SFDC_Object}
     * @public
     */
    objectRef;

    /**
     * @description Is tgis field custom or standard
     * @type {boolean}
     * @public
     */
    isCustom;

    /**
     * @description Tooltip
     * @type {string}
     * @public
     */
    tooltip;

    /**
     * @description Type of this field
     * @type {string}
     * @public
     */
    type;

    /**
     * @description Length of this field in addition to its type
     * @type {number}
     * @public
     */
    length;

    /**
     * @description Is this field unique?
     * @type {boolean}
     * @public
     */
    isUnique;

    /**
     * @description Is this field encrypted?
     * @type {boolean}
     * @public
     */
    isEncrypted;

    /**
     * @description Is this field set as an external id?
     * @type {boolean}
     * @public
     */
    isExternalId;

    /**
     * @description Is this field uses an index in the table?
     * @type {boolean}
     * @public
     */
    isIndexed;

    /**
     * @description Default value
     * @type {string}
     * @public
     */
    defaultValue;

    /**
     * @description If this is a picklist, is it restricted to a list of values?
     * @type {boolean}
     * @public
     */
    isRestrictedPicklist;

    /**
     * @description What is the formula of that field? (obviously only for formula field!)
     * @type {string}
     * @public
     */
    formula;

    /**
     * @description Only for formula field -- List of unique hard coded Salesforce URLs in the formula
     * @type {Array<string>}
     * @public
     */
    hardCodedURLs;

    /**
     * @description Only for formula field -- List of unique hard coded Salesforce IDs in the formula
     * @type {Array<string>}
     * @public
     */
    hardCodedIDs;

}