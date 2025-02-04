import { OrgCheckData } from '../core/orgcheck-api-data';

/**
 * @description Representation of a SObject Limit in Org Check
 */
export class SFDC_Limit extends OrgCheckData {
    
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

    remaining;

    max;

    used;

    usedPercentage;

    /**
     * @description Technical name of that limit
     * @type {string}
     * @public
     */
    type;
}