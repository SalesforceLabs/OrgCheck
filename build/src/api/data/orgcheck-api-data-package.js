import { Data } from '../core/orgcheck-api-data';

export class SFDC_Package extends Data {
    
    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Package' };

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
     * @description Namespace
     * @type {string}
     * @public
     */
    namespace;
    
    /**
     * @description Type of this item
     * @type {string}
     * @public
     */
    type;
}