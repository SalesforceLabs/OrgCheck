import { Data } from '../core/orgcheck-api-data';

export class SFDC_Document extends Data {

    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Document' };

    /**
     * @description Unique identifier of this document in the org.
     * @type {string}
     * @public
     */
    id;

    /**
     * @description Name of the document.
     * @type {string}
     * @public
     */
    name;

    /**
     * @description URL to the document in the org.
     * @type {string}
     * @public
     */
    documentUrl;

    /**
     * @description Is the url of this document is a hard coded value
     * @type {boolean}
     * @public
     */
    isHardCodedURL;

    /**
     * @description Size of the document in bytes.
     * @type {number}
     * @public
     */
    size;

    /**
     * @description Type of the document (e.g. PDF, Word, etc.).
     * @type {string}
     * @public
     */
    type;

    /**
     * @description Description of the document.
     * @type {string}
     * @public
     */
    description;

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
     * @description Name of the folder where this document is stored.
     * @type {string}
     * @public
     */
    folderName;

    /**
     * @description Unique identifier of the folder where this document is stored.
     * @type {string}
     * @public
     */
    folderId;

    /**
     * @description Url to the document in the setup of the org.
     * @type {string}
     * @public
     */
    url;

    /**
     * @description Name of the package where this document is stored.
     * @type {string}
     * @public
     */
    package;
}