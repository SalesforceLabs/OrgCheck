import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_ApexTrigger extends OrgCheckData {
    id;
    name;
    url;

    constructor(setup) {
        super();
        super.initData(setup);
    }
}