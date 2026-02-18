import { DataAliases } from '../core/orgcheck-api-data-aliases';
import { DataWithScore } from '../core/orgcheck-api-data';
import { SFDC_PermissionSet } from './orgcheck-api-data-permissionset';

export interface SFDC_PermissionSetLicense extends DataWithScore {
    
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_PermissionSetLicense;
    
     /**
     * @description Salesforce Id of this item
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
     * @type {Array<string>}
     * @public
     */
    permissionSetIds: Array<string>;

    /**
     * @description Corresponding references of the permission set associated with the current license
     * @type {Array<SFDC_PermissionSet>}
     * @public
     */
    permissionSetRefs: Array<SFDC_PermissionSet>;

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

    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url: string;
}