import { DataAliases } from 'src/api/core/data/orgcheck-api-data-aliases';
import { DataWithoutScore } from 'src/api/core/data/orgcheck-api-data';

/**
 * @description Representation of an Application in Org Check
 */
export interface SfdcApplication extends DataWithoutScore {

    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SfdcApplication;
    
    /**
     * @description Label
     * @type {string}
     * @public
     */
    label: string;
    
    /**
     * @description Name of the potential namespace/package where this item comes from. Empty string if none.
     * @type {string}
     * @public
     */
    package: string;
}