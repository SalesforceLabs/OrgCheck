import { DataAliases } from '../core/orgcheck-api-data-aliases';
import { DataWithScore } from '../core/orgcheck-api-data';

/**
 * @description Representation of a SObject Limit in Org Check
 */
export interface SFDC_Limit extends DataWithScore {
    
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_Limit;

     /**
     * @description Salesforce Id
     * @type {string}
     * @public
     */
    id: string;
    
    /**
     * @description Label of this limit
     * @type {string}
     * @public
     */
    label: string;

    /**
     * @description Remaining count for this limit
     * @type {number}
     * @public
     */
    remaining: number;

    /**
     * @description Maximum count allowed for this limit
     * @type {number}
     * @public
     */
    max: number;

    /**
     * @description Currently used count for this limit
     * @type {number}
     * @public
     */
    used: number;

    /**
     * @description Percentage of used limit
     * @type {number}
     * @public
     */
    usedPercentage: number;

    /**
     * @description Technical name of that limit
     * @type {string}
     * @public
     */
    type: string;
}