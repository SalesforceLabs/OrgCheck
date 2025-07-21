import { DataWithDependencies } from '../core/orgcheck-api-data';

export class SFDC_CustomTab extends DataWithDependencies {

    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Custom Tab' };

    /**
     * @description Unique identifier of this custom tab in the org.
     * @type {string}
     * @public
     */
    id;

    /**
     * @description Name of this custom tab in the org.
     * @type {string}
     * @public
     */
    name;

    /**
     * @description Type of this custom tab
     * @type {string}
     * @public
     */
    type;

    /**
     * @description Full description of that item
     * @type {string}
     * @public
     */
    description;

    /**
     * @description Unique list of hard coded Salesforce URLs in this item
     * @type {Array<string>}
     * @public
     */
    hardCodedURLs;

    /**
     * @description Unique list of hard coded Salesforce IDs in this item
     * @type {Array<string>}
     * @public
     */
    hardCodedIDs;

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

    /**
     * @description Url to the group in the setup of the org.
     * @type {string}
     * @public
     */
    url;

    /**
     * @description Name of the package where this page is stored.
     * @type {string}
     * @public
     */
    package;
}