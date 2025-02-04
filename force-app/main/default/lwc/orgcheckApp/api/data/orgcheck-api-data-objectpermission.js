import { OrgCheckData } from '../core/orgcheck-api-data';
import { SFDC_PermissionSet } from './orgcheck-api-data-permissionset';
import { SFDC_Profile } from './orgcheck-api-data-profile';

/**
 * @description Representation of a SObject permissions (CRUD) for a specific parent (profile or permission set) in Org Check
 */
export class SFDC_ObjectPermission extends OrgCheckData {

    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Object Permissions from Profile or Permission Set' };

    /**
     * @description Salesforce Id of the related parent (profile or permission set)
     * @type {string}
     * @public
     */
    parentId;
    
    /**
     * @description Reference of the related parent
     * @type {SFDC_Profile | SFDC_PermissionSet}
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