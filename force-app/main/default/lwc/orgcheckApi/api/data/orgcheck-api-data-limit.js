import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_Limit extends OrgCheckData {
    id;
    label;
    remaining;
    max;
    used;
    type;

    constructor(setup) {
        super();
        super.initData(setup);
    }
}