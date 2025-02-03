import { OrgCheckDataWithoutScoring } from '../core/orgcheck-api-data';
import { SFDC_PermissionSet } from './orgcheck-api-data-permissionset';
import { SFDC_Profile } from './orgcheck-api-data-profile';

/**
 * @description Representation of an Application permission for a specific parent (profile or permission set) in Org Check
 */
export class SFDC_FieldPermission extends OrgCheckDataWithoutScoring {
    
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
     * @description Api name Id of the field (along with the object)
     * @type {string}
     * @public
     */
    fieldApiName;

    /**
     * @description Permission for this related parent to read this field?
     * @type {boolean}
     * @public
     */
    isRead;
    
    /**
     * @description Permission for this related parent to update this field?
     * @type {boolean}
     * @public
     */
    isEdit;
}