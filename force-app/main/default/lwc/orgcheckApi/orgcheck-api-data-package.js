export class SFDC_Package {
    id;
    name;
    namespace;
    type;
    constructor(setup) { MAP_FIELDS_FROM_SETUP(setup, this, false); }
}