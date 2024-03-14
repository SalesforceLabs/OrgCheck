import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_ObjectRelationShip extends OrgCheckData {
    name;
    childObject;
    fieldName;
    isCascadeDelete;
    isRestrictedDelete;
    
    constructor(setup) {
        super();
        super.initData(setup);
    }
}