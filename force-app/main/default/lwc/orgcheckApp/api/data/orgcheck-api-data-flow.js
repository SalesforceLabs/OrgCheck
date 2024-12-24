import { OrgCheckData, OrgCheckInnerData } from '../core/orgcheck-api-data';

/**
 * Represents a Flow Definition and its Flow Version children
 */
export class SFDC_Flow extends OrgCheckData {
    
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
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url;
    
    /**
     * @description API Version (as a number) set in the metadata for this item.
     * @type {number}
     * @public
     */
    apiVersion;
    currentVersionId;
    currentVersionRef;
    isLatestCurrentVersion;
    isVersionActive;
    versionsCount;
    description;
    type;
    isProcessBuilder;
    
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
}

/**
 * Represents a Flow Version
 */
export class SFDC_FlowVersion extends OrgCheckInnerData {
    
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
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url;
    version;
    
    /**
     * @description API Version (as a number) set in the metadata for this item.
     * @type {number}
     * @public
     */
    apiVersion;
    totalNodeCount;
    dmlCreateNodeCount;
    dmlDeleteNodeCount;
    dmlUpdateNodeCount;
    screenNodeCount;
    isActive;
    description;
    type;
    runningMode;
    
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
    sobject;
    triggerType;
}