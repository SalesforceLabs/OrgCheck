import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_ObjectPermissionsPerParent extends OrgCheckData {
    parentRef;
    objectPermissions;

    constructor(setup) {
        super();
        super.initData(setup);
    }
}