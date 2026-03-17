import { DataAliases } from 'src/api/core/orgcheck-api-data-aliases';
import { DataWithoutScore } from 'src/api/core/orgcheck-api-data';
import { SfdcPermissionSet } from 'src/api/data/orgcheck-api-data-permissionset';
import { SfdcProfile } from 'src/api/data/orgcheck-api-data-profile';

/**
 * @description Representation of a Field permission for a specific parent (profile or permission set) in Org Check
 */
export interface SfdcFieldPermission extends DataWithoutScore {
    
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SfdcFieldPermission;
        
     /**
     * @description Salesforce Id of the related parent (profile or permission set)
     * @type {string}
     * @public
     */
    parentId: string;
    
    /**
     * @description Reference of the related parent
     * @type {SfdcProfile | SfdcPermissionSet}
     * @public
     */
    parentRef: SfdcProfile | SfdcPermissionSet;
    
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