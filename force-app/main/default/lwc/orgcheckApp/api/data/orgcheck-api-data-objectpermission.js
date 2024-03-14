import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_ObjectPermission extends OrgCheckData {
    parentId;
    isParentProfile;
    parentRef;
    objectType;
    isRead;
    isCreate;
    isEdit;
    isDelete;
    isViewAll;
    isModifyAll;

    constructor(setup) {
        super();
        super.initData(setup);
    }
}