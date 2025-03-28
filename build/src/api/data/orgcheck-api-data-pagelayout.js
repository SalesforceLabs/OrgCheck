import { Data } from '../core/orgcheck-api-data';

export class SFDC_PageLayout extends Data {
    
    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Page Layout' };

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
    
    /**
     * @description Type of this item
     * @type {string}
     * @public
     */
    type;
    
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url;
}