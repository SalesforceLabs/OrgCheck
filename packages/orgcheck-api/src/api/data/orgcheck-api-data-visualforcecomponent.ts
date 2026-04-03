import { DataAliases } from 'src/api/core/data/orgcheck-api-data-aliases';
import { DataWithScoreAndDependencies } from 'src/api/core/data/orgcheck-api-data';

export interface SfdcVisualForceComponent extends DataWithScoreAndDependencies {
        
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SfdcVisualForceComponent;
    
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
     * @description API Version (as a number) set in the metadata for this item.
     * @type {number}
     * @public
     */
    apiVersion: number;

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
}