import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_OrgInformation extends OrgCheckData {
    id;
    name;
    type;
    isProduction;
    localNamespace;
    
    constructor(setup) {
        super();
        super.initData(setup);
    }
}