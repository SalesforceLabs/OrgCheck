import { DataWithDependencies } from '../core/orgcheck-api-data';
import { SFDC_Object } from './orgcheck-api-data-object';

export class SFDC_PageLayout extends DataWithDependencies {
    
    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Page Layout' };

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
     * @description Object Id of this page layout 
     * @type {string}
     * @public
     */
    objectId: string;

    /**
     * @description Object reference of this page layout 
     * @type {SFDC_Object}
     * @public
     */
    objectRef: SFDC_Object;

    /**
     * @description Number of profiles assigned to this page layout
     * @type {number}
     * @public
     */
    profileAssignmentCount: number;
    
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url: string;

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
     * @description Number of related lists on this page layout
     * @type {number}
     * @public
     */
    nbRelatedLists: number;

    /**
     * @description Indicates if the attachment related list is included on this page layout
     * @type {boolean}
     * @public
     */
    isAttachmentRelatedListIncluded: boolean;

    /**
     * @description Number of fields on this page layout
     * @type {number}
     * @public
     */ 
    nbFields: number;
}