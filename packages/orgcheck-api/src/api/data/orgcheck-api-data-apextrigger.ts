import { DataAliases } from '../core/orgcheck-api-data-aliases';
import { DataWithScoreAndDependencies } from '../core/orgcheck-api-data';
import { SFDC_Object } from './orgcheck-api-data-object';

/**
 * @description Representation of an Apex Trigger in Org Check
 */
export interface SFDC_ApexTrigger extends DataWithScoreAndDependencies {

    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_ApexTrigger;
    
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
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url: string;
    
    /**
     * @description API Version (as a number) set in the metadata for this item.
     * @type {number}
     * @public
     */
    apiVersion: number;
    
    /**
     * @description Name of the potential namespace/package where this item comes from. Empty string if none.
     * @type {string}
     * @public
     */
    package: string;

    /**
     * @description Number of characters used in the class (without comments)
     * @type {number}
     * @public
     */
    length: number;

    /**
     * @description Is this item active or not?
     * @type {boolean}
     * @public
     */
    isActive: boolean;
    
    /**
     * @description Is this trigger before insert or not?
     * @type {boolean}
     * @public
     */
    beforeInsert: boolean;
    
    /**
     * @description Is this trigger after insert or not?
     * @type {boolean}
     * @public
     */
    afterInsert: boolean;
    
    /**
     * @description Is this trigger before update or not?
     * @type {boolean}
     * @public
     */
    beforeUpdate: boolean;
    
    /**
     * @description Is this trigger after update or not?
     * @type {boolean}
     * @public
     */
    afterUpdate: boolean;
    
    /**
     * @description Is this trigger before delete or not?
     * @type {boolean}
     * @public
     */
    beforeDelete: boolean;
    
    /**
     * @description Is this trigger after delete or not?
     * @type {boolean}
     * @public
     */
    afterDelete: boolean;
    
    /**
     * @description Is this trigger after undelete or not?
     * @type {boolean}
     * @public
     */
    afterUndelete: boolean;
    
    /**
     * @description Identifier of the object for this trigger
     * @type {string}
     * @public
     */
    objectId: string; 
    
    /**
     * @description Reference of the object for this trigger
     * @type {SFDC_Object}
     * @public
     */
    objectRef: SFDC_Object;
    
    /**
     * @description Is this trigger containing SOQL statement?
     * @type {boolean}
     * @public
     */
    hasSOQL: boolean;
    
    /**
     * @description Is this trigger containing DML statement?
     * @type {boolean}
     * @public
     */
    hasDML: boolean;
    
    /**
     * @description Unique list of hard coded Salesforce URLs in this item
     * @type {Array<string>}
     * @public
     */
    hardCodedURLs: Array<string>;

    /**
     * @description Unique list of hard coded Salesforce IDs in this item
     * @type {Array<string>}
     * @public
     */
    hardCodedIDs: Array<string>;

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
}