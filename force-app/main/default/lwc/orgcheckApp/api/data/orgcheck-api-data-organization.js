import { OrgCheckDataWithoutScoring } from '../core/orgcheck-api-data';

export class SFDC_Organization extends OrgCheckDataWithoutScoring {
    
    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Organization' };

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