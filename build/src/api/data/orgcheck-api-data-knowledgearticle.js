import { Data } from '../core/orgcheck-api-data';

export class SFDC_KnowledgeArticle extends Data {

    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Knowledge Article' };

    /**
     * @description Unique identifier of this article in the org.
     * @type {string}
     * @public
     */
    id;

    /**
     * @description Current version id published for this article.
     * @type {string}
     * @public
     */
    versionId;

    /**
     * @description Article number
     * @type {string}
     * @public
     */
    number;

    /**
     * @description Is the url of this document is a hard coded value
     * @type {boolean}
     * @public
     */
    isHardCodedURL;

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
     * @description Url to the article in the setup of the org.
     * @type {string}
     * @public
     */
    url;

    /**
     * @description Title of this article
     * @type {string}
     * @public
     */
    title;
    
    /**
     * @description Url tto this article
     * @type {string}
     * @public
     */
    urlName;
    
    /**
     * @description Publish Status of this article
     * @type {string}
     * @public
     */
    status;
}