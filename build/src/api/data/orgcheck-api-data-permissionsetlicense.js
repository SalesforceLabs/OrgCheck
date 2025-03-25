import { Data } from '../core/orgcheck-api-data';

export class SFDC_PermissionSetLicense extends Data {

    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Permission Set License' };

    id;
    name;
    totalCount;
    usedCount;
    usedPercentage;
    remainingCount;
    permissionSetIds;
    permissionSetRefs;
    distinctActiveAssigneeCount;
    status;
    expirationDate;
    isAvailableForIntegrations;
    createdDate;
    lastModifiedDate;
    url;
}