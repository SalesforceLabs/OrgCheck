// @ts-check

import { OrgCheckDataDependencies } from "./orgcheck-api-data-dependencies";

/**
 * @description This class represents a set of information around a unique instance of a specific artefact (like User, Profile, UserRole, ...) 
 *   Such class are created by a "data factory" (see OrgCheckDataFactory) which also computes its "score" based on specific best practices rules. 
 */
export class OrgCheckData {
    
    /**
     * @description Badness score of the data. Zero means the data follows best practices. Positive value means some areas need to be corrected.
     * @type number
     * @public
     */
    score;
    
    /**
     * @description If the above score is positive, then this property will contain a list of fields that need to be corrected.
     * @type Array<string>
     * @public
     */
    badFields;
    
    /**
     * @description If the above score is positive, then this property will contain a list of reasons ids that explain why the score is positive.
     * @type Array<string>
     * @public
     */
    badReasonIds;

    /**
     * @description Optionnal dependencies information for this data.
     * @type OrgCheckDataDependencies
     * @public
     */
    dependencies;
}

/**
 * @description This class represents a sub set of information included in an instance of OrgCheckData, but it does not need score and 
 *   dependencies automation at its level. The best example of this is a FlowDefinition and its active FlowVersion. The flowDefinition will 
 *   be a OrgCheckData, including a reference to a OrgCheckInnerData to represent the FlowVersion. All score information and dependencies will 
 *   be reported to the flowDef instance. 
 */
export class OrgCheckInnerData {}