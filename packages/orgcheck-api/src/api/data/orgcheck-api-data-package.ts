import { DataAliases } from 'src/api/core/data/orgcheck-api-data-aliases';
import { DataWithScore } from 'src/api/core/data/orgcheck-api-data';

export interface SfdcPackage extends DataWithScore {
    
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SfdcPackage;
    
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