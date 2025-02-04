import { OrgCheckDataDependencies } from "./orgcheck-api-data-dependencies";

/**
 * @description This class represents a set of information around a unique instance of a specific artefact (like User, Profile, UserRole, ...) 
 *   Such class are created by a "data factory" (see OrgCheckDataFactory) which also computes its "score" based on specific best practices rules. 
 */
export class OrgCheckData {
    
    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { console.error('Need to implement static label() method for', this, JSON.stringify(this), this.name); return this.name; };

    /**
     * @description Badness score of the data. Zero means the data follows best practices. Positive value means some areas need to be corrected.
     * @type {number}
     * @public
     */
    score;
    
    /**
     * @description If the above score is positive, then this property will contain a list of fields that need to be corrected.
     * @type {Array<string>}
     * @public
     */
    badFields;
    
    /**
     * @description If the above score is positive, then this property will contain a list of reasons ids that explain why the score is positive.
     * @type {Array<string>}
     * @public
     */
    badReasonIds;
}

/**
 * @description In some cases, the DAPI can retrieve dependencies for org check data and having dependencies participate in the computation of the score.
 */
export class OrgCheckDataWithDependencies extends OrgCheckData {

    /**
     * @description Optionnal dependencies information for this data.
     * @type {OrgCheckDataDependencies}
     * @public
     */
    dependencies;
}

/**
 * @description This class represents a set of information around a unique instance of a specific artefact (like User, Profile, UserRole, ...) 
 *   Such class are created by a "data factory" (see OrgCheckDataFactory) BUT do not need any scoring. 
 */
export class OrgCheckDataWithoutScoring {}