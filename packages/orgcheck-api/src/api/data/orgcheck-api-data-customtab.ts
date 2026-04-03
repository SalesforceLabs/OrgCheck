import { DataAliases } from 'src/api/core/data/orgcheck-api-data-aliases';
import { DataWithScoreAndDependencies } from 'src/api/core/data/orgcheck-api-data';

export interface SfdcCustomTab extends DataWithScoreAndDependencies {

    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SfdcCustomTab;

     /**
     * @description Unique identifier of this custom tab in the org.
     * @type {string}
     * @public
     */
    id: string;

    /**
     * @description Name of this custom tab in the org.
     * @type {string}
     * @public
     */
    name: string;

    /**
     * @description Type of this custom tab
     * @type {string}
     * @public
     */
    type: string;

    /**
     * @description Full description of that item
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
     * @description Url to the group in the setup of the org.
     * @type {string}
     * @public
     */
    url: string;

    /**
     * @description Name of the package where this page is stored.
     * @type {string}
     * @public
     */
    package: string;
}