import { Data } from '../core/orgcheck-api-data';

export class SFDC_CollaborationGroup extends Data {

    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Chatter Group' };

    /**
     * @description Unique identifier of this group in the org.
     * @type {string}
     * @public
     */
    id;

    /**
     * @description Name of this group in the org.
     * @type {string}
     * @public
     */
    name;

    /**
     * @description Description of this group in the org.
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
     * @description Name of the package where this group is stored.
     * @type {string}
     * @public
     */
    package;
}