import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_RecordType extends OrgCheckData {
    id;
    name;
    developerName;
    url;
    isActive;
    isAvailable;
    isDefaultRecordTypeMapping;
    isMaster;

    constructor(setup) {
        super();
        super.initData(setup);
    }
}