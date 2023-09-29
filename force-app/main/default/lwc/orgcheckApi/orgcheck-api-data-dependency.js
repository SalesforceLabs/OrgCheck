class SFDC_Dependency {
    id;
    name;
    type;
    refId;
    refName;
    refType;
    constructor(setup) { MAP_FIELDS_FROM_SETUP(setup, this, false); }
}