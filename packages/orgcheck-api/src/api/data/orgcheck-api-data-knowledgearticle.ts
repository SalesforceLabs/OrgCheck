import { DataAliases } from 'src/api/core/data/orgcheck-api-data-aliases';
import { DataWithScore } from 'src/api/core/data/orgcheck-api-data';

export interface SfdcKnowledgeArticle extends DataWithScore {
    
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SfdcKnowledgeArticle;

    /**
     * @description Current version id published for this article.
     * @type {string}
     * @public
     */
    versionId: string;

    /**
     * @description Article number
     * @type {string}
     * @public
     */
    number: string;

    /**
     * @description Is the url of this document is a hard coded value
     * @type {boolean}
     * @public
     */
    isHardCodedURL: boolean;

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
     * @description Title of this article
     * @type {string}
     * @public
     */
    title: string;
    
    /**
     * @description Url tto this article
     * @type {string}
     * @public
     */
    urlName: string;
    
    /**
     * @description Publish Status of this article
     * @type {string}
     * @public
     */
    status: string;
}