import { Data } from '../core/orgcheck-api-data';
import { SFDC_Object } from './orgcheck-api-data-object';

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
    
    /**
     * @description Developer Name
     * @type {string}
     * @public
     */
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

    /**
     * @description Is this RT available?
     * @type {boolean}
     * @public
     */
    isAvailable;

    /**
     * @description Is this the default RT mapping?
     * @type {boolean}
     * @public
     */
    isDefaultRecordTypeMapping;

    /**
     * @description Is this the master record type?
     * @type {boolean}
     * @public
     */
    isMaster;

    /**
     * @description Object Id of thid record type
     * @type {string}
     * @public
     */
    objectId;

    /**
     * @description Object reference of this record type
     * @type {SFDC_Object}
     * @public
     */
    objectRef;
}