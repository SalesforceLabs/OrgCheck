import { DataAliases } from '../core/orgcheck-api-data-aliases';
import { DataWithScore } from '../core/orgcheck-api-data';

export interface SFDC_Document extends DataWithScore {
    
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_Document;

     /**
     * @description Unique identifier of this document in the org.
     * @type {string}
     * @public
     */
    id: string;

    /**
     * @description Name of the document.
     * @type {string}
     * @public
     */
    name: string;

    /**
     * @description URL to the document in the org.
     * @type {string}
     * @public
     */
    documentUrl: string;

    /**
     * @description Is the url of this document is a hard coded value
     * @type {boolean}
     * @public
     */
    isHardCodedURL: boolean;

    /**
     * @description Size of the document in bytes.
     * @type {number}
     * @public
     */
    size: number;

    /**
     * @description Type of the document (e.g. PDF, Word, etc.).
     * @type {string}
     * @public
     */
    type: string;

    /**
     * @description Description of the document.
     * @type {string}
     * @public
     */
    description: string;

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
     * @description Name of the folder where this document is stored.
     * @type {string}
     * @public
     */
    folderName: string;

    /**
     * @description Unique identifier of the folder where this document is stored.
     * @type {string}
     * @public
     */
    folderId: string;

    /**
     * @description Url to the document in the setup of the org.
     * @type {string}
     * @public
     */
    url: string;

    /**
     * @description Name of the package where this document is stored.
     * @type {string}
     * @public
     */
    package: string;
}