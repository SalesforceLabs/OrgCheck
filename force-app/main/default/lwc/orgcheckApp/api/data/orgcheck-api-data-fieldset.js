import { OrgCheckData } from '../core/orgcheck-api-data';

/**
 * @description Representation of a Field Set in Org Check
 */
export class SFDC_FieldSet extends OrgCheckData {
    
    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Field Set' };

    /**
     * @description Salesforce Id
     * @type {string}
     * @public
     */
    id;
    
    /**
     * @description Label
     * @type {string}
     * @public
     */
    label;
    
    /**
     * @description Full description of that item
     * @type {string}
     * @public
     */
    description;
    
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url;
}