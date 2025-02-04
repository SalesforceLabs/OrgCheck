import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_ObjectRelationShip extends OrgCheckData {
    
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
    
    childObject;
    fieldName;
    isCascadeDelete;
    isRestrictedDelete;
}