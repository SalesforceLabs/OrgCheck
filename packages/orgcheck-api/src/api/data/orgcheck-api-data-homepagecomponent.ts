import { DataWithDependencies } from '../core/orgcheck-api-data';

export class SFDC_HomePageComponent extends DataWithDependencies {

    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Home Page Component' };

    /**
     * @description Unique identifier of this page in the org.
     * @type {string}
     * @public
     */
    id: string;

    /**
     * @description Name of this page in the org.
     * @type {string}
     * @public
     */
    name: string;

    /**
     * @description Is this item has an empty body?
     * @type {boolean}
     * @public
     */
    isBodyEmpty: boolean;

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
     * @description Name of the package where this page is stored.
     * @type {string}
     * @public
     */
    package: string;
}