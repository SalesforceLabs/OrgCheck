import { DataAliases } from '../core/orgcheck-api-data-aliases';
import { DataWithScore } from '../core/orgcheck-api-data';

/**
 * @description Representation of a Field Set in Org Check
 */
export interface SFDC_FieldSet extends DataWithScore {
    
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_FieldSet;
        
     /**
     * @description Salesforce Id
     * @type {string}
     * @public
     */
    id: string;
    
    /**
     * @description Label
     * @type {string}
     * @public
     */
    label: string;
    
    /**
     * @description Full description of that item
     * @type {string}
     * @public
     */
    description: string;
    
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url: string;
}