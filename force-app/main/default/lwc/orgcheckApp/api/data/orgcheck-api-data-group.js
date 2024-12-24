// @ts-check

import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_Group extends OrgCheckData {
    
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
    
    developerName;
    includeBosses;
    includeSubordinates;
    relatedId;
    nbDirectMembers;
    directUserIds;
    directUserRefs;
    directGroupIds;
    directGroupRefs;
    isPublicGroup;
    isQueue;
    type;
}