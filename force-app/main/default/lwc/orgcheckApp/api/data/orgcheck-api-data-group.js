import { OrgCheckData } from '../core/orgcheck-api-data';

/**
 * @description Representation of a User Group in Org Check
 */
export class SFDC_Group extends OrgCheckData {
    
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