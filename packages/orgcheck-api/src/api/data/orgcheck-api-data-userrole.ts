import { DataAliases } from 'src/api/core/orgcheck-api-data-aliases';
import { DataWithScore } from 'src/api/core/orgcheck-api-data';
import { SfdcUser } from 'src/api/data/orgcheck-api-data-user';

export interface SfdcUserRole extends DataWithScore {
    
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SfdcUserRole;
    
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
     * @description API Name
     * @type {string}
     * @public
     */
    apiname: string;
    
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url: string;

    /**
     * @description Salesforce Id of the related parent Role
     * @type {string}
     * @public
     */
    parentId: string;

    /**
     * @description The related parent reference
     * @type {SfdcUserRole}}
     * @public
     */
    parentRef: SfdcUserRole;

    /**
     * @description Level of this role in the global role hierarchy
     * @type {number}
     * @public
     */
    level: number;
    
    /**
     * @description Is this role a parent?
     * @type {boolean}
     * @public
     */
    hasParent: boolean;
    
    /**
     * @description Number of active members in this role
     * @type {number}
     * @public
     */
    activeMembersCount: number;
    
    /** 
     * @description Array of active member user ids
     * @type {Array<string>}
     * @public
     */
    activeMemberIds: Array<string>;
    
    /**
     * @description Array of active member user references
     * @type {Array<SfdcUser>}
     * @public
     */
    activeMemberRefs: Array<SfdcUser>;
    
    /**
     * @description Does this role have active members?
     * @type {boolean}
     * @public
     */
    hasActiveMembers: boolean;
}