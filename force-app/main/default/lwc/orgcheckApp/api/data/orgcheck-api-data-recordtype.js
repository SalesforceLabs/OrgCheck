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

    /**
     * @description Is this item active or not?
     * @type {boolean}
     * @public
     */
    isActive;
    isAvailable;
    isDefaultRecordTypeMapping;
    isMaster;
}