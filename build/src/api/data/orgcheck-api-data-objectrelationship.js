import { DataWithoutScoring } from '../core/orgcheck-api-data';

export class SFDC_ObjectRelationShip extends DataWithoutScoring {
    
    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'SObject Releationship' };

    /**
     * @description Name
     * @type {string}
     * @public
     */
    name;
    
    /**
     * @description Child object
     * @type {string}
     * @public
     */
    childObject;

    /**
     * @description Field that support the lookup in the parent object
     * @type {string}
     * @public
     */
    fieldName;

    /**
     * @description Is cascade delete enabled?
     * @type {boolean}
     * @public
     */
    isCascadeDelete;

    /**
     * @description Is restricted delete enabled?
     * @type {boolean}
     * @public
     */
    isRestrictedDelete;
}