import { DataAliases } from 'src/api/core/data/orgcheck-api-data-aliases';
import { DataWithScoreAndDependencies } from 'src/api/core/data/orgcheck-api-data';

export interface SfdcHomePageComponent extends DataWithScoreAndDependencies {

    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SfdcHomePageComponent;

    /**
     * @description Does this item have an empty body?
     * @type {boolean}
     * @public
     */
    isBodyEmpty: boolean;

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
     * @description Name of the package where this page is stored.
     * @type {string}
     * @public
     */
    package: string;
}