import { DataAliases } from 'src/api/core/orgcheck-api-data-aliases';
import { DataWithScore } from 'src/api/core/orgcheck-api-data';

/**
 * @description Representation of a Field Set in Org Check
 */
export interface SfdcFieldSet extends DataWithScore {
    
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SfdcFieldSet;
        
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