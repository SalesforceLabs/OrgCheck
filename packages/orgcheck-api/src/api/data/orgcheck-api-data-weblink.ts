import { DataAliases } from 'src/api/core/data/orgcheck-api-data-aliases';
import { DataWithScoreAndDependencies } from 'src/api/core/data/orgcheck-api-data';
import { SfdcObject } from 'src/api/data/orgcheck-api-data-object';

export interface SfdcWebLink extends DataWithScoreAndDependencies {
    
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SfdcWebLink;

    /**
     * @description Unique list of hard coded Salesforce URLs in this item
     * @type {string[]}
     * @public
     */
    hardCodedURLs: string[];

    /**
     * @description Unique list of hard coded Salesforce IDs in this item
     * @type {string[]}
     * @public
     */
    hardCodedIDs: string[];
    
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
     * @description Identifier of the object for this trigger
     * @type {string}
     * @public
     */
    objectId: string; 
    
    /**
     * @description Reference of the object for this trigger
     * @type {SfdcObject}
     * @public
     */
    objectRef: SfdcObject;
}