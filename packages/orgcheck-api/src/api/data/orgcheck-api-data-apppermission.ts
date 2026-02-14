import { DataWithoutScoring } from '../core/orgcheck-api-data';
import { SFDC_Application } from './orgcheck-api-data-application';
import { SFDC_PermissionSet } from './orgcheck-api-data-permissionset';
import { SFDC_Profile } from './orgcheck-api-data-profile';

/**
 * @description Representation of an Application permission for a specific parent (profile or permission set) in Org Check
 */
export class SFDC_AppPermission extends DataWithoutScoring {
    
    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Application Permission from Profile or Permission Set' };

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
     * @description Salesforce Id of the application
     * @type {string}
     * @public
     */
    appId: string;
    
    /**
     * @description Reference of the related application
     * @type {SFDC_Application}
     * @public
     */
    appRef: SFDC_Application;

    /**
     * @description Permission for this related parent to access this app?
     * @type {boolean}
     * @public
     */
    isAccessible: boolean;
    
    /**
     * @description Permission for this related parent to see this app?
     * @type {boolean}
     * @public
     */
    isVisible: boolean;
}