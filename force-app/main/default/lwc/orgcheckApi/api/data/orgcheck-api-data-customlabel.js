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
    
    constructor(setup) {
        super();
        super.initData(setup);
    }
}