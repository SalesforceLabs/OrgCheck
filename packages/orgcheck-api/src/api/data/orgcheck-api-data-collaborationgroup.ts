import { DataAliases } from '../core/orgcheck-api-data-aliases';
import { DataWithScore } from '../core/orgcheck-api-data';

export interface SFDC_CollaborationGroup extends DataWithScore {
    
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_CollaborationGroup;
    
     /**
     * @description Unique identifier of this group in the org.
     * @type {string}
     * @public
     */
    id: string;

    /**
     * @description Name of this group in the org.
     * @type {string}
     * @public
     */
    name: string;

    /**
     * @description Description of this group in the org.
     * @type {string}
     * @public
     */
    description: string;

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

    /**
     * @description Url to the group in the setup of the org.
     * @type {string}
     * @public
     */
    url: string;

    /**
     * @description Name of the package where this group is stored.
     * @type {string}
     * @public
     */
    package: string;
}