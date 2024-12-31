import { OrgCheckData } from '../core/orgcheck-api-data';
import { SFDC_PermissionSet } from './orgcheck-api-data-permissionset';
import { SFDC_Profile } from './orgcheck-api-data-profile';

/**
 * @description Representation of an Application permission for a specific parent (profile or permission set) in Org Check
 */
export class SFDC_AppPermission extends OrgCheckData {
    
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
     * @description Salesforce Id of the application
     * @type {string}
     * @public
     */
    appId;
    
    /**
     * @description Name of the application
     * @type {string}
     * @public
     */
    appName;
    
    /**
     * @description Label of the application
     * @type {string}
     * @public
     */
    appLabel;
    
    /**
     * @description Name of the potential namespace/package where this application comes from. Empty string if none.
     * @type {string}
     * @public
     */
    appPackage;
    
    /**
     * @description Permission for this related parent to access this app?
     * @type {boolean}
     * @public
     */
    isAccessible;
    
    /**
     * @description Permission for this related parent to see this app?
     * @type {boolean}
     * @public
     */
    isVisible;
}