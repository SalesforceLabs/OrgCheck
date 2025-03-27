import { Data } from '../core/orgcheck-api-data';

/**
 * @description Representation of a SObject Limit in Org Check
 */
export class SFDC_Limit extends Data {
    
    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'SObject Limit' };

    /**
     * @description Salesforce Id
     * @type {string}
     * @public
     */
    id;
    
    /**
     * @description Label of this limit
     * @type {string}
     * @public
     */
    label;

    /**
     * @description Remaining count for this limit
     * @type {number}
     * @public
     */
    remaining;

    /**
     * @description Maximum count allowed for this limit
     * @type {number}
     * @public
     */
    max;

    /**
     * @description Currently used count for this limit
     * @type {number}
     * @public
     */
    used;

    /**
     * @description Percentage of used limit
     * @type {number}
     * @public
     */
    usedPercentage;

    /**
     * @description Technical name of that limit
     * @type {string}
     * @public
     */
    type;
}