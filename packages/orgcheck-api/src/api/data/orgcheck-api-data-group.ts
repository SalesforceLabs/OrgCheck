import { DataAliases } from '../core/orgcheck-api-data-aliases';
import { DataWithScore } from '../core/orgcheck-api-data';
import { SFDC_User } from './orgcheck-api-data-user';

/**
 * @description Representation of a User Group in Org Check
 */
export interface SFDC_Group extends DataWithScore {
    
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_Group;

     /**
     * @description Salesforce Id
     * @type {string}
     * @public
     */
    id: string;
    
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url: string;
    
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name: string;
    
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
     * @type {Array<string>}
     * @public
     */
    directUserIds: Array<string>;

    /**
     * @description List of direct user references
     * @type {Array<SFDC_User>}
     * @public
     */
    directUserRefs: Array<SFDC_User>;

    /**
     * @description List of direct group ids
     * @type {Array<string>}
     * @public
     */
    directGroupIds: Array<string>;

    /**
     * @description List of direct group references
     * @type {Array<SFDC_Group>}
     * @public
     */
    directGroupRefs: Array<SFDC_Group>;

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