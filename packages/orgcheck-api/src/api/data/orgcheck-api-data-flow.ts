import { DataAliases } from '../core/orgcheck-api-data-aliases';
import { DataWithScoreAndDependencies, DataWithoutScore } from '../core/orgcheck-api-data';

/**
 * Represents a Flow Definition and its Flow Version children
 */
export interface SFDC_Flow extends DataWithScoreAndDependencies {
    
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_Flow;

    /**
     * @description Salesforce Id
     * @type {string}
     * @public
     */
    id: string;
    
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name: string;
    
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url: string;
    
    /**
     * @description API Version (as a number) set in the metadata for this item.
     * @type {number}
     * @public
     */
    apiVersion: number;

    /**
     * @description Salesforce Id of the current flow version being used by this flow
     * @type {string}
     * @public
     */
    currentVersionId: string;
    
    /**
     * @description Reference of the current flow version being used by this flow
     * @type {SFDC_FlowVersion}
     * @public
     */
    currentVersionRef: SFDC_FlowVersion;
    
    /**
     * @description Is the current flow version of this flow is the latest version of this flow?
     * @type {boolean}
     * @public
     */
    isLatestCurrentVersion: boolean;
    
    /**
     * @description Is the version active?
     * @type {boolean}
     * @public
     */
    isVersionActive: boolean;
    
    /**
     * @description Count of versions for this flow
     * @type {number}
     * @public
     */
    versionsCount: number;
    
    /**
     * @description Full description of that item
     * @type {string}
     * @public
     */
    description: string;
    
    /**
     * @description Type of this flow
     * @type {string}
     * @public
     */
    type: string;
    
    /**
     * @description Is this a PB or not?
     * @type {boolean}
     * @public
     */
    isProcessBuilder: boolean;
    
    /**
     * @description Is this a screen flow or not?
     * @type {boolean}
     * @public
     */
    isScreenFlow: boolean;

    /**
     * @description Date/Time when this item was created in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    createdDate: number;
    
    /**
     * @description Date/Time when this item was last modified in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastModifiedDate: number;
}

/**
 * Represents a Flow Version
 */
export interface SFDC_FlowVersion extends DataWithoutScore {
    
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_FlowVersion;

    /**
     * @description Salesforce Id
     * @type {string}
     * @public
     */
    id: string;
    
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name: string;
    
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url: string;

    /**
     * @description API Version (as a string) set in the metadata for this item.
     * @type {string}
     * @public
     */
    version: string;
    
    /**
     * @description API Version (as a number) set in the metadata for this item.
     * @type {number}
     * @public
     */
    apiVersion: number;

    /**
     * @description Number of nodes in this flow version
     * @type {number}
     * @public
     */
    totalNodeCount: number;
    
    /**
     * @description Number of nodes in this flow version of DML Create type
     * @type {number}
     * @public
     */
    dmlCreateNodeCount: number;
    
    /**
     * @description Number of nodes in this flow version of DML Delete type
     * @type {number}
     * @public
     */
    dmlDeleteNodeCount: number;
    
    /**
     * @description Number of nodes in this flow version of DML Update type
     * @type {number}
     * @public
     */
    dmlUpdateNodeCount: number;
    
    /**
     * @description Number of nodes in this flow version of Screen type
     * @type {number}
     * @public
     */
    screenNodeCount: number;
    
    /**
     * @description Is this item active or not?
     * @type {boolean}
     * @public
     */
    isActive: boolean;
    
    /**
     * @description Full description of that item
     * @type {string}
     * @public
     */
    description: string;

    /**
     * @description Type of this item
     * @type {string}
     * @public
     */
    type: string;
    
    /**
     * @description Is this a PB or not?
     * @type {boolean}
     * @public
     */
    isProcessBuilder: boolean;

    /**
     * @description Is this a screen flow or not?
     * @type {boolean}
     * @public
     */
    isScreenFlow: boolean;

    /**
     * @description Running mode of this flow version
     * @type {string}
     * @public
     */
    runningMode: string;
    
    /**
     * @description Date/Time when this item was created in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    createdDate: number;
    
    /**
     * @description Date/Time when this item was last modified in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastModifiedDate: number;
    
    /**
     * @description Name of the optional sobject this flow version is related to
     * @type {string}
     * @public
     */
    sobject: string;
    
    /**
     * @description Trigger type of this flow version (optional)
     * @type {string}
     * @public
     */
    triggerType: string;

    /**
     * @description Record trigger type of this flow version (optional)
     * @type {string}
     * @public
     */
    recordTriggerType: string;

    /**
     * @description LFS Violations (list of rule names) for this flow version
     * @type {Array<string>}
     * @public
     */
    lfsViolations: Array<string>;
}