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

    /**
     * @description Salesforce Id of the current flow version being used by this flow
     * @type {string}
     * @public
     */
    currentVersionId;
    
    /**
     * @description Reference of the current flow version being used by this flow
     * @type {SFDC_FlowVersion}
     * @public
     */
    currentVersionRef;
    
    /**
     * @description Is the current flow version of this flow is the latest version of this flow?
     * @type {boolean}
     * @public
     */
    isLatestCurrentVersion;
    
    /**
     * @description Is the version active?
     * @type {boolean}
     * @public
     */
    isVersionActive;
    
    /**
     * @description Count of versions for this flow
     * @type {number}
     * @public
     */
    versionsCount;
    
    /**
     * @description Full description of that item
     * @type {string}
     * @public
     */
    description;
    
    /**
     * @description Type of this flow
     * @type {string}
     * @public
     */
    type;
    
    /**
     * @description Is this a PB or not?
     * @type {boolean}
     * @public
     */
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

    /**
     * @description API Version (as a string) set in the metadata for this item.
     * @type {string}
     * @public
     */
    version;
    
    /**
     * @description API Version (as a number) set in the metadata for this item.
     * @type {number}
     * @public
     */
    apiVersion;

    /**
     * @description Number of nodes in this flow version
     * @type {number}
     * @public
     */
    totalNodeCount;
    
    /**
     * @description Number of nodes in this flow version of DML Create type
     * @type {number}
     * @public
     */
    dmlCreateNodeCount;
    
    /**
     * @description Number of nodes in this flow version of DML Delete type
     * @type {number}
     * @public
     */
    dmlDeleteNodeCount;
    
    /**
     * @description Number of nodes in this flow version of DML Update type
     * @type {number}
     * @public
     */
    dmlUpdateNodeCount;
    
    /**
     * @description Number of nodes in this flow version of Screen type
     * @type {number}
     * @public
     */
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

    /**
     * @description Type of this item
     * @type {string}
     * @public
     */
    type;
    
    /**
     * @description Running mode of this flow version
     * @type {string}
     * @public
     */
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
    
    /**
     * @description Name of the optional sobject this flow version is related to
     * @type {string}
     * @public
     */
    sobject;
    
    /**
     * @description Trigger type of this flow version (optional)
     * @type {string}
     * @public
     */
    triggerType;

    /**
     * @description Record trigger type of this flow version (optional)
     * @type {string}
     * @public
     */
    recordTriggerType;

    /**
     * @description LFS Violations (list of rule names) for this flow version
     * @type {Array<string>}
     * @public
     */
    lfsViolations;
}