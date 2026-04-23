import { DataAliases } from 'src/api/core/data/orgcheck-api-data-aliases';
import { DataWithScore } from 'src/api/core/data/orgcheck-api-data';

/**
 * @description Representation of a Salesforce Release Update.
 */
export interface SfdcReleaseUpdate extends DataWithScore {
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SfdcReleaseUpdate;

    /**
     * @description Release update category.
     * @type {string}
     * @public
     */
    category: string;

    /**
     * @description Date when this update is due in the org.
     * @type {number}
     * @public
     */
    dueDate: number;

    /**
     * @description Remaining days before due date
     * @type {number}
     * @public
     */
    remainingDaysBeforeDueDate: number;

    /**
     * @description Whether this release update is released or not.
     * @type {boolean}
     * @public
     */
    isReleased: boolean;

    /**
     * @description Number of completed steps.
     * @type {number}
     * @public
     */
    nbCompletedSteps: number;

    /**
     * @description Number of all steps.
     * @type {number}
     * @public
     */
    nbAllSteps: number;

    /**
     * @description Percentage of completion based on nbCompletedSteps and nbAllSteps
     * @type {number}
     * @public
     */
    completionPercentage: number;

    /**
     * @description Release label.
     * @type {string}
     * @public
     */
    sfdcReleaseLabel: string;

    /**
     * @description Release update status.
     * @type {string}
     * @public
     */
    status: string;
}
