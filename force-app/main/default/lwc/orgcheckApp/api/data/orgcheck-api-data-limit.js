// @ts-check

import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_Limit extends OrgCheckData {
    
    /**
     * @description Salesforce Id
     * @type {string}
     * @public
     */
    id;
    
    label;
    remaining;
    max;
    used;
    usedPercentage;
    type;
}