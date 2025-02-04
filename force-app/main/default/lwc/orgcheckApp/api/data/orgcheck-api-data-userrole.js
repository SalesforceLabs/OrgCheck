import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_UserRole extends OrgCheckData {

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
    
    hasParent;
    
    activeMembersCount;
    
    activeMemberIds;
    
    activeMemberRefs;
    
    hasActiveMembers;
    
    inactiveMembersCount;
    
    hasInactiveMembers;
    
    isExternal;
}