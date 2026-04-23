import { DataAliases } from 'src/api/core/data/orgcheck-api-data-aliases';
import { DataWithScore } from 'src/api/core/data/orgcheck-api-data';

/**
 * @description Representation of a Salesforce Active Sharing Rule.
 */
export interface SfdcSharingRule extends DataWithScore {

    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SfdcSharingRule;         

    /**
     * @description API name of the SObject this rule applies to (e.g. "Account")
     * @type {string}
     * @public
     */
    objectType: string;

    /**
     * @description Whether this is an owner-based or criteria-based rule
     * @type {string}
     * @public
     */
    type: string;

    /**
     * @description Access level granted by the rule ("Read", "Edit", "All")
     * @type {string}
     * @public
     */
    accessLevel: string;

    /**
     * @description Developer name of the target (group, queue, role, etc.)
     * @type {string}
     * @public
     */
    sharedToName: string;

    /**
     * @description Type of the target ("Group", "Queue", "Role", "RoleAndSubordinates", etc.)
     * @type {string}
     * @public
     */
    sharedToType: string;

    /**
     * @description Conditions of this rule (if any)
     * @type {string[]}
     * @public
     */
    sharedFromConditions: string[];

    /**
     * @description Conditions logic of this rule (if any)
     * @type {string}
     * @public
     */
    sharedFromLogic: string;
}
