import { OrgCheckData, OrgCheckInnerData } from '../core/orgcheck-api-data';

/**
 * Represents a Flow Definition and its Flow Version children
 */
export class SFDC_Flow extends OrgCheckData {
    id;
    name;
    url;
    apiVersion;
    currentVersionId;
    currentVersionRef;
    isLatestCurrentVersion;
    isVersionActive;
    versionsCount;
    description;
    type;
    isProcessBuilder;
    createdDate;
    lastModifiedDate;
}

/**
 * Represents a Flow Version
 */
export class SFDC_FlowVersion extends OrgCheckInnerData {
    id;
    name;
    url;
    version;
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
    createdDate;
    lastModifiedDate;
    sobject;
    triggerType;
}