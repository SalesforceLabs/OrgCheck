import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_Dependency extends OrgCheckData {
    id;
    name;
    type;
    refId;
    refName;
    refType;

    constructor(setup) {
        super();
        super.initData(setup);
    }
}