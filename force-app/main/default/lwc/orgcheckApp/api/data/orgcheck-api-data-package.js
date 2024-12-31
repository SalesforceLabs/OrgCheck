import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_Package extends OrgCheckData {
    
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