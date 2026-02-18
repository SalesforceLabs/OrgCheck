import { DataAliases } from '../core/orgcheck-api-data-aliases';
import { DataWithoutScore } from '../core/orgcheck-api-data';
import { SFDC_PermissionSet } from './orgcheck-api-data-permissionset';
import { SFDC_Profile } from './orgcheck-api-data-profile';

/**
 * @description Representation of a Field permission for a specific parent (profile or permission set) in Org Check
 */
export interface SFDC_FieldPermission extends DataWithoutScore {
    
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_FieldPermission;
        
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
     * @description Api name Id of the field (along with the object)
     * @type {string}
     * @public
     */
    fieldApiName: string;

    /**
     * @description Permission for this related parent to read this field?
     * @type {boolean}
     * @public
     */
    isRead: boolean;
    
    /**
     * @description Permission for this related parent to update this field?
     * @type {boolean}
     * @public
     */
    isEdit: boolean;
}