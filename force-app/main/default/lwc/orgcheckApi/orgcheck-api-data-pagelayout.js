export class SFDC_PageLayout {
    id;
    name;
    type;
    url;
    constructor(setup) { MAP_FIELDS_FROM_SETUP(setup, this, false); }
}