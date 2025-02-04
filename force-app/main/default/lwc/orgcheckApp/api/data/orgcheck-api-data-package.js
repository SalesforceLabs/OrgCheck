import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_Package extends OrgCheckData {
    
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
    
    namespace;
    type;
}