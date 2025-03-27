import { Data } from '../core/orgcheck-api-data';
import { SFDC_PermissionSet } from './orgcheck-api-data-permissionset';

export class SFDC_PermissionSetLicense extends Data {

    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Permission Set License' };

    /**
     * @description Salesforce Id of this item
     * @type {string}
     * @public
     */ 
    id;

    /**
     * @description Name
     * @type {string}
     * @public
     */
    name;

    /**
     * @description Total count of licenses
     * @type {number}
     * @public
     */
    totalCount;

    /**
     * @description Used count of licenses
     * @type {number}
     * @public
     */
    usedCount;

    /**
     * @description Percentage of used licenses
     * @type {number}
     * @public
     */
    usedPercentage;

    /**
     * @description Remaining count of licenses
     * @type {number}
     * @public
     */
    remainingCount;

    /**
     * @description Salesforce Id of the permission set associated with the current license
     * @type {Array<string>}
     * @public
     */
    permissionSetIds;

    /**
     * @description Corresponding references of the permission set associated with the current license
     * @type {Array<SFDC_PermissionSet>}
     * @public
     */
    permissionSetRefs;

    /**
     * @description Number of distinct users assigned to the permission set license
     * @type {number}
     * @public
     */
    distinctActiveAssigneeCount;

    /**
     * @description Status of the permission set license
     * @type {string}
     * @public
     */
    status;

    /**
     * @description Expiration date of the permission set license
     * @type {number}
     * @public
     */
    expirationDate;

    /**
     * @description Is the permission set license available for integrations
     * @type {boolean}
     * @public
     */
    isAvailableForIntegrations;

    /**
     * @description Created date of the permission set license
     * @type {number}
     * @public
     */
    createdDate;

    /**
     * @description Last modified date of the permission set license
     * @type {number}
     * @public
     */
    lastModifiedDate;

    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url;
}