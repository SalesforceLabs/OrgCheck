import { OrgCheckData } from '../core/orgcheck-api-data';
import { SFDC_PermissionSet } from './orgcheck-api-data-permissionset';
import { SFDC_Profile } from './orgcheck-api-data-profile';

/**
 * @description Representation of a SObject permissions (CRUD) for a specific parent (profile or permission set) in Org Check
 */
export class SFDC_ObjectPermission extends OrgCheckData {

    /**
     * @description Salesforce Id of the related parent
     * @type {string}
     * @public
     */
    parentId;

    /**
     * @description Is the related parent is a profile? (if not this is a permission set)
     * @type {boolean}
     * @public
     */
    isParentProfile;

    /**
     * @description The related parent reference
     * @type {SFDC_Profile | SFDC_PermissionSet}}
     * @public
     */
    parentRef;

    /** 
     * @description The object’s API name. For example, Merchandise__c
     * @type {string}
     * @public
     */
    objectType;

    /**
     * @description Right to read?
     * @type {boolean}
     * @public
     */
    isRead;

    /**
     * @description Right to create?
     * @type {boolean}
     * @public
     */
    isCreate;

    /**
     * @description Right to update?
     * @type {boolean}
     * @public
     */
    isEdit;

    /**
     * @description Right to delete?
     * @type {boolean}
     * @public
     */
    isDelete;

    /**
     * @description Right to view all records?
     * @type {boolean}
     * @public
     */
    isViewAll;

    /**
     * @description Right to update all records?
     * @type {boolean}
     * @public
     */
    isModifyAll;
}