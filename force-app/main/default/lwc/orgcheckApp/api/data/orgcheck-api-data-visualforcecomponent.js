// @ts-check

import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_VisualForceComponent extends OrgCheckData {
    
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
     * @description API Version (as a number) set in the metadata for this item.
     * @type {number}
     * @public
     */
    apiVersion;
    
    /**
     * @description Name of the potential namespace/package where this item comes from. Empty string if none.
     * @type {string}
     * @public
     */
    package;
    
    /**
     * @description Date/Time when this item was created in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    createdDate;
    
    /**
     * @description Date/Time when this item was last modified in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastModifiedDate;
    description;
    
    
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url;
}