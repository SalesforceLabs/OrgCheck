import { DataAliases } from 'src/api/core/data/orgcheck-api-data-aliases';
import { DataWithScoreAndDependencies } from 'src/api/core/data/orgcheck-api-data';
import { SfdcObject } from 'src/api/data/orgcheck-api-data-object';

export interface SfdcPageLayout extends DataWithScoreAndDependencies {
    
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SfdcPageLayout;
    
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
     * @type {SfdcObject}
     * @public
     */
    objectRef: SfdcObject;

    /**
     * @description Number of profiles assigned to this page layout
     * @type {number}
     * @public
     */
    profileAssignmentCount: number;

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