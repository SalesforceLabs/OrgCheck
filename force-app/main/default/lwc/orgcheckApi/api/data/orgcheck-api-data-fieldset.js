import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_FieldSet extends OrgCheckData {
    id;
    label;
    description;
    url;

    constructor(setup) {
        super();
        super.initData(setup);
    }
}