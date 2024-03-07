import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_AppPermissionsPerParent extends OrgCheckData {
    parentRef;
    appPermissions;

    constructor(setup) {
        super();
        super.initData(setup);
    }
}