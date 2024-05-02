/**
 * This class represents a set of information around a unique instance of a specific artefact (like User, Profile, UserRole, ...) 
 * Such class are created by a "data factory" (see OrgCheckDataFactory) which also computes its "score" based on specific best practices rules. 
 */
export class OrgCheckData {
    score;
    badFields;
    badReasonIds;
    dependencies;
}

/**
 * This class represents a sub set of information included in a, instance of OrgCheckData, but it does not need score and dependencies automation at its level. 
 * The best example of this is a FlowDefinition and its active FlowVersion. The flowDefinition will be a OrgCheckData, including a reference to a OrgCheckInnerData 
 * to represent the FlowVersion. All score information and dependencies will be reported to the flowDef instance. 
 */
export class OrgCheckInnerData {}