import { DataAliases } from 'src/api/core/data/orgcheck-api-data-aliases';
import { DataWithScore } from 'src/api/core/data/orgcheck-api-data';

export interface SfdcWorkflow extends DataWithScore {
    
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SfdcWorkflow;
    
    /**
     * @description Full description of that item
     * @type {string}
     * @public
     */
    description: string;

    /**
     * @description Direct actions associated with this item
     * @type {any[]}
     * @public
     */
    actions: any[];

    /**
     * @description Future actions associated with this item
     * @type {any[]}
     * @public
     */
    futureActions: any[];

    /**
     * @description Empty time triggers associated with this item
     * @type {any[]}
     * @public
     */
    emptyTimeTriggers: any[];

    /**
     * @description Is this item active or not?
     * @type {boolean}
     * @public
     */
    isActive: boolean;
    
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
     * @description True if this item has at least one action associated with it
     * @type {boolean}
     * @public
     */
    hasAction: boolean;
}