import { DataAliases } from 'src/api/core/data/orgcheck-api-data-aliases';
import { DataWithScore } from 'src/api/core/data/orgcheck-api-data';
import { SfdcObject } from 'src/api/data/orgcheck-api-data-object';

export interface SfdcRecordType extends DataWithScore {
    
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SfdcRecordType;

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
     * @type {SfdcObject}
     * @public
     */
    objectRef: SfdcObject;
}