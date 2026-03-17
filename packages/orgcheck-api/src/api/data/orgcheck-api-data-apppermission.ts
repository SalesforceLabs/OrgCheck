import { DataAliases } from 'src/api/core/orgcheck-api-data-aliases';
import { DataWithoutScore } from 'src/api/core/orgcheck-api-data';
import { SfdcApplication } from 'src/api/data/orgcheck-api-data-application';
import { SfdcPermissionSet } from 'src/api/data/orgcheck-api-data-permissionset';
import { SfdcProfile } from 'src/api/data/orgcheck-api-data-profile';

/**
 * @description Representation of an Application permission for a specific parent (profile or permission set) in Org Check
 */
export interface SfdcAppPermission extends DataWithoutScore {

    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SfdcAppPermission;
    
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
     * @description Salesforce Id of the application
     * @type {string}
     * @public
     */
    appId: string;
    
    /**
     * @description Reference of the related application
     * @type {SfdcApplication}
     * @public
     */
    appRef: SfdcApplication;

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