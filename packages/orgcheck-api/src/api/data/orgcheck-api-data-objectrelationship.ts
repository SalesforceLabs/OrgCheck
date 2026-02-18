import { DataAliases } from '../core/orgcheck-api-data-aliases';
import { DataWithoutScore } from '../core/orgcheck-api-data';

export interface SFDC_ObjectRelationShip extends DataWithoutScore {
    
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_ObjectRelationShip;
        
     /**
     * @description Name
     * @type {string}
     * @public
     */
    name: string;
    
    /**
     * @description Child object
     * @type {string}
     * @public
     */
    childObject: string;

    /**
     * @description Field that support the lookup in the parent object
     * @type {string}
     * @public
     */
    fieldName: string;

    /**
     * @description Is cascade delete enabled?
     * @type {boolean}
     * @public
     */
    isCascadeDelete: boolean;

    /**
     * @description Is restricted delete enabled?
     * @type {boolean}
     * @public
     */
    isRestrictedDelete: boolean;
}