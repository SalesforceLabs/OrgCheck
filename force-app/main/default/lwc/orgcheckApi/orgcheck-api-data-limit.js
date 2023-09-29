export class SFDC_Limit {
    id;
    label;
    remaining;
    max;
    used;
    type;
    constructor(setup) { MAP_FIELDS_FROM_SETUP(setup, this, false); }    
}