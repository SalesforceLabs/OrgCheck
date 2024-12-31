import { OrgCheckDataWithoutScoring } from '../core/orgcheck-api-data';

export class SFDC_Organization extends OrgCheckDataWithoutScoring {
    
    /**
     * @description Salesforce Id
     * @type {string}
     * @public
     */
    id;
    
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name;
    
    type;
    isDeveloperEdition;
    isSandbox;
    isTrial;
    isProduction;
    localNamespace;
    
}