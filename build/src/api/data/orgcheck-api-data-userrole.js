import { Data } from '../core/orgcheck-api-data';
import { SFDC_User } from './orgcheck-api-data-user';

export class SFDC_UserRole extends Data {

    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Role' };
    
    /**
     * @description Salesforce Id
     * @type {string}
     * @public
     */
    id;
    
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name;
    
    /**
     * @description API Name
     * @type {string}
     * @public
     */
    apiname;
    
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url;

    /**
     * @description Salesforce Id of the related parent Role
     * @type {string}
     * @public
     */
    parentId;

    /**
     * @description The related parent reference
     * @type {SFDC_UserRole}}
     * @public
     */
    parentRef;

    /**
     * @description Level of this role in the global role hierarchy
     * @type {number}
     * @public
     */
    level;
    
    /**
     * @description Is this role a parent?
     * @type {boolean}
     * @public
     */
    hasParent;
    
    /**
     * @description Number of active members in this role
     * @type {number}
     * @public
     */
    activeMembersCount;
    
    /** 
     * @description Array of active member user ids
     * @type {Array<string>}
     * @public
     */
    activeMemberIds;
    
    /**
     * @description Array of active member user references
     * @type {Array<SFDC_User>}
     * @public
     */
    activeMemberRefs;
    
    /**
     * @description Does this role have active members?
     * @type {boolean}
     * @public
     */
    hasActiveMembers;
}