import { DataWithDependencies, DataWithoutScoring } from '../core/orgcheck-api-data';

/**
 * Represents a Flow Definition and its Flow Version children
 */
export class SFDC_Flow extends DataWithDependencies {
    
    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Flow or Process Builder' };

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
    
    /**
     * @description Full description of that item
     * @type {string}
     * @public
     */
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
export class SFDC_FlowVersion extends DataWithoutScoring {
    
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
    
    /**
     * @description Is this item active or not?
     * @type {boolean}
     * @public
     */
    isActive;
    
    /**
     * @description Full description of that item
     * @type {string}
     * @public
     */
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