import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_AppPermission extends OrgCheckData {
    parentId;
    isParentProfile;
    parentRef;
    appId;
    appName;
    appLabel;
    appPackage;
    isAccessible;
    isVisible;
}