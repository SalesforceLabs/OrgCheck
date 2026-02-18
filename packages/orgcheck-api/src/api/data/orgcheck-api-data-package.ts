import { DataAliases } from '../core/orgcheck-api-data-aliases';
import { DataWithScore } from '../core/orgcheck-api-data';

export interface SFDC_Package extends DataWithScore {
    
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_Package;
        
     /**
     * @description Salesforce Id
     * @type {string}
     * @public
     */
    id: string;
    
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name: string;
    
    /**
     * @description Namespace
     * @type {string}
     * @public
     */
    namespace: string;
    
    /**
     * @description Type of this item
     * @type {string}
     * @public
     */
    type: string;
}