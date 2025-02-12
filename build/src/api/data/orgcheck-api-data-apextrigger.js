import { Data } from '../core/orgcheck-api-data';
import { SFDC_Object } from './orgcheck-api-data-object';

/**
 * @description Representation of an Apex Trigger in Org Check
 */
export class SFDC_ApexTrigger extends Data {
    
    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Apex Trigger' };

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
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url;
    
    /**
     * @description API Version (as a number) set in the metadata for this item.
     * @type {number}
     * @public
     */
    apiVersion;
    
    /**
     * @description Name of the potential namespace/package where this item comes from. Empty string if none.
     * @type {string}
     * @public
     */
    package;

    /**
     * @description Number of characters used in the class (without comments)
     * @type {number}
     * @public
     */
    length;

    /**
     * @description Is this item active or not?
     * @type {boolean}
     * @public
     */
    isActive;
    
    /**
     * @description Is this trigger before insert or not?
     * @type {boolean}
     * @public
     */
    beforeInsert;
    
    /**
     * @description Is this trigger after insert or not?
     * @type {boolean}
     * @public
     */
    afterInsert;
    
    /**
     * @description Is this trigger before update or not?
     * @type {boolean}
     * @public
     */
    beforeUpdate;
    
    /**
     * @description Is this trigger after update or not?
     * @type {boolean}
     * @public
     */
    afterUpdate;
    
    /**
     * @description Is this trigger before delete or not?
     * @type {boolean}
     * @public
     */
    beforeDelete;
    
    /**
     * @description Is this trigger after delete or not?
     * @type {boolean}
     * @public
     */
    afterDelete;
    
    /**
     * @description Is this trigger after undelete or not?
     * @type {boolean}
     * @public
     */
    afterUndelete;
    
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
    
    /**
     * @description Is this trigger containing SOQL statement?
     * @type {boolean}
     * @public
     */
    hasSOQL;
    
    /**
     * @description Is this trigger containing DML statement?
     * @type {boolean}
     * @public
     */
    hasDML;
    
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