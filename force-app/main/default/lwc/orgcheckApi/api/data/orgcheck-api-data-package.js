import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_Package extends OrgCheckData {
    id;
    name;
    namespace;
    type;

    constructor(setup) {
        super();
        super.initData(setup);
    }
}