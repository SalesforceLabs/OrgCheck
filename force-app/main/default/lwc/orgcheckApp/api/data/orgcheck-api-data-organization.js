import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_Organization extends OrgCheckData {
    id;
    name;
    type;
    isDeveloperEdition;
    isSandbox;
    isTrial;
    isProduction;
    localNamespace;
    
}