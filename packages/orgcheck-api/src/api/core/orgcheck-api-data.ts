import { DataAliases } from "./orgcheck-api-data-aliases";
import { DataDependenciesForOneItem } from "./orgcheck-api-data-dependencies";

/**
 * @description This interface represents a data in Org Check
 * @see DataWithScore
 * @see DataWithoutScore
 * @see DataWithScoreAndDependencies
 */
export interface Data {

    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases;
}

/**
 * @description This interface represents a set of information around a unique instance of a specific artefact (like User, Profile, UserRole, ...) 
 *   Such interface are created by a "data factory" (see DataFactory) which also computes its "score" based on specific best practices rules. 
 */
export interface DataWithScore extends Data {

    /**
     * @description Badness score of the data. Zero means the data follows best practices. Positive value means some areas need to be corrected.
     * @type {number}
     * @public
     */
    score: number;
    
    /**
     * @description If the above score is positive, then this property will contain a list of fields that need to be corrected.
     * @type {Array<string>}
     * @public
     */
    badFields: Array<string>;
    
    /**
     * @description If the above score is positive, then this property will contain a list of reasons ids that explain why the score is positive.
     * @type {Array<number>}
     * @public
     */
    badReasonIds: Array<number>;
}

/**
 * @description In some cases, the DAPI can retrieve dependencies for org check data and having dependencies participate in the computation of the score.
 */
export interface DataWithScoreAndDependencies extends DataWithScore {

    /**
     * @description Optionnal dependencies information for this data.
     * @type {DataDependenciesForOneItem}
     * @public
     */
    dependencies: DataDependenciesForOneItem;
}

/**
 * @description This interface represents a set of information around a unique instance of a specific artefact (like User, Profile, UserRole, ...) 
 *   Such interface are created by a "data factory" (see DataFactory) BUT do not need any scoring. 
 */
export interface DataWithoutScore extends Data {}