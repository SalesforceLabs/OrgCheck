/**
 * @description Information about the current Daily API Request usage limit
 */
export interface SalesforceUsageInformationIntf {

    /**
     * @description Current ratio (not percentage!) of Daily API Request limit usage
     * @type {number}
     * @public
     */
    currentUsageRatio: number;

    /**
     * @description Current percentage of Daily API Request limit usage
     * @type {string}
     * @public
     */
    currentUsagePercentage: string;

    /**
     * @description Threshold value when percentage is reaching a "warning" zone (not yet a "critical" zone)
     * @type {number}
     * @public
     */
    yellowThresholdPercentage: number;

    /**
     * @description Threshold value when percentage is reaching a "critical" zone.
     * @type {number}
     * @public
     */
    redThresholdPercentage: number;

    /**
     * @description Is the current percentage in the "OK" zone?
     * @type {boolean}
     * @public
     */
    isGreenZone: boolean;

    /**
     * @description Is the current percentage in the "warning" zone?
     * @type {boolean}
     * @public
     */
    isYellowZone: boolean;

    /**
     * @description Is the current percentage in the "critical" zone?
     * @type {boolean}
     * @public
     */
    isRedZone: boolean;
}