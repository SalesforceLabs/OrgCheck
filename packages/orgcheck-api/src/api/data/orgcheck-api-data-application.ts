import { DataAliases } from '../core/orgcheck-api-data-aliases';
import { DataWithoutScore } from '../core/orgcheck-api-data';

/**
 * @description Representation of an Application in Org Check
 */
export interface SFDC_Application extends DataWithoutScore {

    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_Application;
    
    /**
     * @description Salesforce Id of the application
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