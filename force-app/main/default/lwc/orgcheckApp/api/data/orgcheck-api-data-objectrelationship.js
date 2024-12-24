// @ts-check

import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_ObjectRelationShip extends OrgCheckData {
    
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