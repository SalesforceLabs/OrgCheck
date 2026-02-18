import { DataAliases } from '../core/orgcheck-api-data-aliases';
import { DataWithScoreAndDependencies } from '../core/orgcheck-api-data';
import { SFDC_Object } from './orgcheck-api-data-object';

export interface SFDC_WebLink extends DataWithScoreAndDependencies {
    
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_WebLink;
        
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
     * @description Type of the link
     * @type {string}
     * @public
     */
    type: string;
    
    /**
     * @description Behavior of the link
     * @type {string}
     * @public
     */
    behavior: string;

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
     * @description Full description of that item
     * @type {string}
     * @public
     */
    description: string;

    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url: string;

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
}