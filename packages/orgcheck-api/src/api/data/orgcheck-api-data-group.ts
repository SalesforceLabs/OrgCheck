import { DataAliases } from 'src/api/core/data/orgcheck-api-data-aliases';
import { DataWithScore } from 'src/api/core/data/orgcheck-api-data';
import { SfdcUser } from 'src/api/data/orgcheck-api-data-user';

/**
 * @description Representation of a User Group in Org Check
 */
export interface SfdcGroup extends DataWithScore {
    
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SfdcGroup;
    
    /**
     * @description Developer Name
     * @type {string}
     * @public
     */
    developerName: string;

    /**
     * @description Does it include bosses?
     * @type {boolean}
     * @public
     */
    includeBosses: boolean;

    /**
     * @description Does it include subordinates?
     * @type {boolean}
     * @public
     */
    includeSubordinates: boolean;

    /**
     * @description Salesfiorce Id of the related entity for this "box"
     * @type {string}
     * @public
     */
    relatedId: string;

    /**
     * @description Count of direct members (regardless if there are users or groups or roles etc.)
     * @type {number}
     * @public
     */
    nbDirectMembers: number;

    /**
     * @description List of direct user ids
     * @type {string[]}
     * @public
     */
    directUserIds: string[];

    /**
     * @description List of direct user references
     * @type {SfdcUser[]}
     * @public
     */
    directUserRefs: SfdcUser[];

    /**
     * @description List of direct group ids
     * @type {string[]}
     * @public
     */
    directGroupIds: string[];

    /**
     * @description List of direct group references
     * @type {SfdcGroup[]}
     * @public
     */
    directGroupRefs: SfdcGroup[];

    /**
     * @description Is this a public group?
     * @type {boolean}
     * @public
     */
    isPublicGroup: boolean;

    /**
     * @description Is this a queue?
     * @type {boolean}
     * @public
     */
    isQueue: boolean;

    /**
     * @description Type of this item
     * @type {string}
     * @public
     */
    type: string;
}