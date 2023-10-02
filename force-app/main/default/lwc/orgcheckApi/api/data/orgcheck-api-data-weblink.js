import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_WebLink extends OrgCheckData {
    id;
    name;
    url;

    constructor(setup) {
        super();
        super.initData(setup);
    }
}