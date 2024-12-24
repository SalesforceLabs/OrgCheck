// @ts-check

import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_RecordType extends OrgCheckData {
    
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
    
    developerName;
    
    
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url;
    isActive;
    isAvailable;
    isDefaultRecordTypeMapping;
    isMaster;
}