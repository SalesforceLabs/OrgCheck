import { Data } from '../core/orgcheck-api-data';

export class SFDC_EmailTemplate extends Data {

    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'EmailTemplate' };

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
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url: string;

    /**
     * @description Type of the UI this item is used in
     * @type {string}
     * @public
     */
    uiType: string;

    /**
     * @description Type of this item
     * @type {string}
     * @public
     */
    type: string;

    /**
     * @description Name of the potential namespace/package where this item comes from. Empty string if none.
     * @type {string}
     * @public
     */
    package: string;

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
     * @description Description of the document.
     * @type {string}
     * @public
     */
    description: string;

    /**
     * @description Id of the folder this email template is in
     * @type {string}
     * @public
     */
    folderId: string;

    /**
     * @description Name of the folder this email template is in
     * @type {string}
     * @public
     */
    folderName: string;

    /**
     * @description API Version (as a number) set in the metadata for this item.
     * @type {number}
     * @public
     */
    apiVersion: number;

    /**
     * @description Is this item active or not?
     * @type {boolean}
     * @public
     */
    isActive: boolean;

    /**
     * @description Date of the last time this email template was used.
     * @type {number}
     * @public
     */
    lastUsedDate: number

    /**
     * @description Number of time this email template was used.
     * @type {number}
     * @public
     */
    timesUsed: number;
}