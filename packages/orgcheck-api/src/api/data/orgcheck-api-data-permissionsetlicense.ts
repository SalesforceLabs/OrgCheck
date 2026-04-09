import { DataAliases } from 'src/api/core/data/orgcheck-api-data-aliases';
import { DataWithScore } from 'src/api/core/data/orgcheck-api-data';
import { SfdcPermissionSet } from 'src/api/data/orgcheck-api-data-permissionset';

export interface SfdcPermissionSetLicense extends DataWithScore {
    
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SfdcPermissionSetLicense;

    /**
     * @description Total count of licenses
     * @type {number}
     * @public
     */
    totalCount: number;

    /**
     * @description Used count of licenses
     * @type {number}
     * @public
     */
    usedCount: number;

    /**
     * @description Percentage of used licenses
     * @type {number}
     * @public
     */
    usedPercentage: number;

    /**
     * @description Remaining count of licenses
     * @type {number}
     * @public
     */
    remainingCount: number;

    /**
     * @description Salesforce Id of the permission set associated with the current license
     * @type {string[]}
     * @public
     */
    permissionSetIds: string[];

    /**
     * @description Corresponding references of the permission set associated with the current license
     * @type {SfdcPermissionSet[]}
     * @public
     */
    permissionSetRefs: SfdcPermissionSet[];

    /**
     * @description Number of distinct users assigned to the permission set license
     * @type {number}
     * @public
     */
    distinctActiveAssigneeCount: number;

    /**
     * @description Status of the permission set license
     * @type {string}
     * @public
     */
    status: string;

    /**
     * @description Expiration date of the permission set license
     * @type {number}
     * @public
     */
    expirationDate: number;

    /**
     * @description Is the permission set license available for integrations
     * @type {boolean}
     * @public
     */
    isAvailableForIntegrations: boolean;

    /**
     * @description Created date of the permission set license
     * @type {number}
     * @public
     */
    createdDate: number;

    /**
     * @description Last modified date of the permission set license
     * @type {number}
     * @public
     */
    lastModifiedDate: number;
}