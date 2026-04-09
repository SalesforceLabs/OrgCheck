import { DataAliases } from 'src/api/core/data/orgcheck-api-data-aliases';
import { DataWithScore } from 'src/api/core/data/orgcheck-api-data';

export interface SfdcDocument extends DataWithScore {
    
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SfdcDocument;

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
     * @description Name of the package where this document is stored.
     * @type {string}
     * @public
     */
    package: string;
}