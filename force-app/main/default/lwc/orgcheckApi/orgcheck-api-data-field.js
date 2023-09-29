export class SFDC_Field {
    id;
    url;
    name;
    label;
    package;
    description;
    createdDate;
    lastModifiedDate;
    objectId; 
    objectRef;
    isCustom;
    tooltip;
    type;
    length;
    isUnique;
    isEncrypted;
    isExternalId;
    defaultValue;
    formula;
    constructor(setup) { MAP_FIELDS_FROM_SETUP(setup, this, true, 'id'); }
}