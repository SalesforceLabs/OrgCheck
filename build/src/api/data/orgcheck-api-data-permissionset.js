import { SFDC_Profile } from './orgcheck-api-data-profile';

export class SFDC_PermissionSet extends SFDC_Profile {

    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Permission Set or Permission Set Group' };

    isGroup;
    groupId;
}