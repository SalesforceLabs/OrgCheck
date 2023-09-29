export class SFDC_ObjectRelationShip {
    name;
    childObject;
    fieldName;
    isCascadeDelete;
    isRestrictedDelete;
    constructor(setup) { MAP_FIELDS_FROM_SETUP(setup, this, false); }
}