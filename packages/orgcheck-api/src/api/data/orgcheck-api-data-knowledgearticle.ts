import { DataAliases } from '../core/orgcheck-api-data-aliases';
import { DataWithScore } from '../core/orgcheck-api-data';

export interface SFDC_KnowledgeArticle extends DataWithScore {
    
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_KnowledgeArticle;

     /**
     * @description Unique identifier of this article in the org.
     * @type {string}
     * @public
     */
    id: string;

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
     * @description Url to the article in the setup of the org.
     * @type {string}
     * @public
     */
    url: string;

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