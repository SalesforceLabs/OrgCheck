// @ts-check

import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_PageLayout extends OrgCheckData {
    
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
    
    type;
    
    
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url;
}