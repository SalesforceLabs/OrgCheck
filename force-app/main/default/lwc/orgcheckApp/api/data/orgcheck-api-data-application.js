import { OrgCheckDataWithoutScoring } from '../core/orgcheck-api-data';

/**
 * @description Representation of an Application in Org Check
 */
export class SFDC_Application extends OrgCheckDataWithoutScoring {
    
    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Application' };

    /**
     * @description Salesforce Id of the application
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
    
    /**
     * @description Label
     * @type {string}
     * @public
     */
    label;
    
    /**
     * @description Name of the potential namespace/package where this item comes from. Empty string if none.
     * @type {string}
     * @public
     */
    package;
}