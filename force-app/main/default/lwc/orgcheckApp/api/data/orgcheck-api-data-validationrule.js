// @ts-check

import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_ValidationRule extends OrgCheckData {
    
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
    
    isActive;
    description;
    errorDisplayField;
    errorMessage;
    
    
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url;
}