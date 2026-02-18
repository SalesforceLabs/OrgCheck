import { DataAliases } from '../core/orgcheck-api-data-aliases';
import { DataWithScore } from '../core/orgcheck-api-data';
import { SFDC_PermissionSet } from './orgcheck-api-data-permissionset';
import { SFDC_Profile } from './orgcheck-api-data-profile';

/**
 * @description Representation of a SObject permissions (CRUD) for a specific parent (profile or permission set) in Org Check
 */
export interface SFDC_ObjectPermission extends DataWithScore {
    
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_ObjectPermission;
    
     /**
     * @description Salesforce Id of the related parent (profile or permission set)
     * @type {string}
     * @public
     */
    parentId: string;
    
    /**
     * @description Reference of the related parent
     * @type {SFDC_Profile | SFDC_PermissionSet}
     * @public
     */
    parentRef: SFDC_Profile | SFDC_PermissionSet;
    
    /** 
     * @description The object’s API name. For example, Merchandise__c
     * @type {string}
     * @public
     */
    objectType: string;

    /**
     * @description Right to read?
     * @type {boolean}
     * @public
     */
    isRead: boolean;

    /**
     * @description Right to create?
     * @type {boolean}
     * @public
     */
    isCreate: boolean;

    /**
     * @description Right to update?
     * @type {boolean}
     * @public
     */
    isEdit: boolean;

    /**
     * @description Right to delete?
     * @type {boolean}
     * @public
     */
    isDelete: boolean;

    /**
     * @description Right to view all records?
     * @type {boolean}
     * @public
     */
    isViewAll: boolean;

    /**
     * @description Right to update all records?
     * @type {boolean}
     * @public
     */
    isModifyAll: boolean;
}