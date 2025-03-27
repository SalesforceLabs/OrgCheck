import { DataWithoutScoring } from '../core/orgcheck-api-data';

export class SFDC_Organization extends DataWithoutScoring {
    
    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Organization' };

    /**
     * @description Salesforce Id
     * @type {string}
     * @public
     */
    id;
    
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name;
    
    /**
     * @description Type of this item
     * @type {string}
     * @public
     */
    type;

    /**
     * @description Is this organization a Developer Edition enviroment?
     * @type {boolean}
     * @public
     */
    isDeveloperEdition;

    /**
     * @description Is this organization a Sandbox environment?
     * @type {boolean}
     * @public
     */
    isSandbox;

    /**
     * @description Is this organization a Trial environment?
     * @type {boolean}
     * @public
     */
    isTrial;

    /**
     * @description Is this organization a Production environment?
     * @type {boolean}
     * @public
     */
    isProduction;

    /**
     * @description Local namespace of this organization
     * @type {string}
     * @public
     */
    localNamespace;
}