import { DataAliases } from '../core/orgcheck-api-data-aliases';
import { DataWithScore } from '../core/orgcheck-api-data';
import { SFDC_Object } from './orgcheck-api-data-object';

export interface SFDC_RecordType extends DataWithScore {
    
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_RecordType;
    
     /**
     * @description Salesforce Id
     * @type {string}
     * @public
     */
    id: string;
    
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name: string;
    
    /**
     * @description Developer Name
     * @type {string}
     * @public
     */
    developerName: string;
    
    /**
     * @description Name of the potential namespace/package where this item comes from. Empty string if none.
     * @type {string}
     * @public
     */
    package: string;

    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url: string;

    /**
     * @description Is this item active or not?
     * @type {boolean}
     * @public
     */
    isActive: boolean;

    /**
     * @description Is this record type available?
     * @type {boolean}
     * @public
     */
    isAvailable: boolean;

    /**
     * @description Is this the default record type?
     * @type {boolean}
     * @public
     */
    isDefault: boolean;

    /**
     * @description Is this the master record type?
     * @type {boolean}
     * @public
     */
    isMaster: boolean;

    /**
     * @description Object Id of thid record type
     * @type {string}
     * @public
     */
    objectId: string;

    /**
     * @description Object reference of this record type
     * @type {SFDC_Object}
     * @public
     */
    objectRef: SFDC_Object;
}