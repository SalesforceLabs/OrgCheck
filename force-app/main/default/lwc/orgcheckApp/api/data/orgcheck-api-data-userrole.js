// @ts-check

import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_UserRole extends OrgCheckData {

    
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
    
    api
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name;
    
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url;
    parentId;
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