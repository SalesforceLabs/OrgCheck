import { SFDC_Profile } from './orgcheck-api-data-profile';

export class SFDC_PermissionSet extends SFDC_Profile {
    isGroup;
    assigneeProfileIds;
    assigneeProfileRefs;
}