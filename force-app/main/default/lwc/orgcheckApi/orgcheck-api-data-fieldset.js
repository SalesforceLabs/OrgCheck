export class SFDC_FieldSet {
    id;
    label;
    description;
    url;
    constructor(setup) { MAP_FIELDS_FROM_SETUP(setup, this, false); }
}