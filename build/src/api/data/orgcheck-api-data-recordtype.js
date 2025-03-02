import { Data } from '../core/orgcheck-api-data';

export class SFDC_RecordType extends Data {
    
    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Record Type' };

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