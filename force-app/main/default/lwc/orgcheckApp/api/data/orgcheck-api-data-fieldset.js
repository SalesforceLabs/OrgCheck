// @ts-check

import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_FieldSet extends OrgCheckData {
    
    /**
     * @description Salesforce Id
     * @type {string}
     * @public
     */
    id;
    
    label;
    description;
    
    
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url;
}