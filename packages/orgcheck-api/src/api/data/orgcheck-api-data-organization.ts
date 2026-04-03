import { DataAliases } from 'src/api/core/data/orgcheck-api-data-aliases';
import { DataWithoutScore } from 'src/api/core/data/orgcheck-api-data';

export interface SfdcOrganization extends DataWithoutScore {
    
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SfdcOrganization;
        
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
     * @description Type of this item
     * @type {string}
     * @public
     */
    type: string;

    /**
     * @description Is this organization a Developer Edition enviroment?
     * @type {boolean}
     * @public
     */
    isDeveloperEdition: boolean;

    /**
     * @description Is this organization a Sandbox environment?
     * @type {boolean}
     * @public
     */
    isSandbox: boolean;

    /**
     * @description Is this organization a Trial environment?
     * @type {boolean}
     * @public
     */
    isTrial: boolean;

    /**
     * @description Is this organization a Production environment?
     * @type {boolean}
     * @public
     */
    isProduction: boolean;

    /**
     * @description Local namespace of this organization
     * @type {string}
     * @public
     */
    localNamespace: string;
}