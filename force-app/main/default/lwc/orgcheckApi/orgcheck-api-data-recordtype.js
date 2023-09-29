export class SFDC_RecordType {
    id;
    name;
    developerName;
    url;
    isActive;
    isAvailable;
    isDefaultRecordTypeMapping;
    isMaster;
    constructor(setup) { MAP_FIELDS_FROM_SETUP(setup, this, false); }
}