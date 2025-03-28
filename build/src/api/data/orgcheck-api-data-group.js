import { Data } from '../core/orgcheck-api-data';
import { SFDC_User } from './orgcheck-api-data-user';

/**
 * @description Representation of a User Group in Org Check
 */
export class SFDC_Group extends Data {
    
    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Public Group or Queue' };

    /**
     * @description Salesforce Id
     * @type {string}
     * @public
     */
    id;
    
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url;
    
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name;
    
    /**
     * @description Developer Name
     * @type {string}
     * @public
     */
    developerName;

    /**
     * @description Does it include bosses?
     * @type {boolean}
     * @public
     */
    includeBosses;

    /**
     * @description Does it include subordinates?
     * @type {boolean}
     * @public
     */
    includeSubordinates;

    /**
     * @description Salesfiorce Id of the related entity for this "box"
     * @public
     */
    relatedId;

    /**
     * @description Count of direct members (regardless if there are users or groups or roles etc.)
     * @type {number}
     * @public
     */
    nbDirectMembers;

    /**
     * @description List of direct user ids
     * @type {Array<string>}
     * @public
     */
    directUserIds;

    /**
     * @description List of direct user references
     * @type {Array<SFDC_User>}
     * @public
     */
    directUserRefs;

    /**
     * @description List of direct group ids
     * @type {Array<string>}
     * @public
     */
    directGroupIds;

    /**
     * @description List of direct group references
     * @type {Array<SFDC_Group>}
     * @public
     */
    directGroupRefs;

    /**
     * @description Is this a public group?
     * @type {boolean}
     * @public
     */
    isPublicGroup;

    /**
     * @description Is this a queue?
     * @type {boolean}
     * @public
     */
    isQueue;

    /**
     * @description Type of this item
     * @type {string}
     * @public
     */
    type;
}