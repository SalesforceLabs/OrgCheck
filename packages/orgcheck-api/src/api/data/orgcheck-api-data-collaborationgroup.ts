import { DataAliases } from 'src/api/core/data/orgcheck-api-data-aliases';
import { DataWithScore } from 'src/api/core/data/orgcheck-api-data';

export interface SfdcCollaborationGroup extends DataWithScore {
    
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SfdcCollaborationGroup;
    
    /**
     * @description Description of this group in the org.
     * @type {string}
     * @public
     */
    description: string;

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
     * @description Name of the package where this group is stored.
     * @type {string}
     * @public
     */
    package: string;
}