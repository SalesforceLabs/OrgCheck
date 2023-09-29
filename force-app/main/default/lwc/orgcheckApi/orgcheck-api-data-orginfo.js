export class SFDC_OrgInformation {
    id;
    name;
    type;
    isProduction;
    localNamespace;
    constructor(setup) { MAP_FIELDS_FROM_SETUP(setup, this, false); }
}