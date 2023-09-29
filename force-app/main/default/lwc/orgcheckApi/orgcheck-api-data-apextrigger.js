export class SFDC_ApexTrigger {
    id;
    name;
    url;
    constructor(setup) { MAP_FIELDS_FROM_SETUP(setup, this, false); }
}