import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_CustomLabel extends OrgCheckData {
    id;
    name;
    package;
    label;
    category;
    isProtected;
    language;
    value;
    url;
    createdDate;
    lastModifiedDate;

    constructor(setup) {
        super();
        super.initData(setup);
    }
}