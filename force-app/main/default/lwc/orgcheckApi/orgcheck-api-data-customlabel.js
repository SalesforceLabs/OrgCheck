export class SFDC_CustomLabel {
    id;
    name;
    package;
    label;
    category;
    isProtected;
    language;
    value;
    url;
    constructor(setup) { MAP_FIELDS_FROM_SETUP(setup, this, false); }
}