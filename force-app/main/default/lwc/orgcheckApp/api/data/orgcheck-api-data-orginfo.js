import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_OrgInformation extends OrgCheckData {
    id;
    name;
    type;
    isDeveloperEdition;
    isSandbox;
    isTrial;
    isProduction;
    localNamespace;
    
    constructor(setup) {
        super();
        super.initData(setup);
    }
}