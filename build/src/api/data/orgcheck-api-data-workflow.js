import { Data } from '../core/orgcheck-api-data';

export class SFDC_Workflow extends Data {
    
    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Workflow' };

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

    /**
     * @description Direct actions associated with this item
     * @type {Array<any>}
     * @public
     */
    actions;

    /**
     * @description Future actions associated with this item
     * @type {Array<any>}
     * @public
     */
    futureActions;

    /**
     * @description Empty time triggers associated with this item
     * @type {Array<any>}
     * @public
     */
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

    /**
     * @description True if this item has at least one action associated with it
     * @type {boolean}
     * @public
     */
    hasAction;
}