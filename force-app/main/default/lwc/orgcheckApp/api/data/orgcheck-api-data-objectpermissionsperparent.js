import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_ObjectPermissionsPerParent extends OrgCheckData {
    parentId;
    isParentProfile;
    parentRef;
    objectPermissions;

    constructor(setup) {
        super();
        super.initData(setup);
    }
}