export class SFDC_ValidationRule {
    id;
    name;
    isActive;
    description;
    errorDisplayField;
    errorMessage;
    url;
    constructor(setup) { MAP_FIELDS_FROM_SETUP(setup, this, false); }    
}