import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_Workflow extends OrgCheckData {
    
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
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url;
    
    /**
     * @description Full description of that item
     * @type {string}
     * @public
     */
    description;
    actions;
    futureActions;
    emptyTimeTriggers;

    /**
     * @description Is this item active or not?
     * @type {boolean}
     * @public
     */
    isActive;
    
    /**
     * @description Date/Time when this item was created in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    createdDate;
    
    /**
     * @description Date/Time when this item was last modified in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastModifiedDate;
    hasAction;
}