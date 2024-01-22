import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_Flow extends OrgCheckData {
    id;
    name;
    url;
    definitionId;
    definitionName;
    version;
    apiVersion;
    dmlCreates;
    dmlDeletes;
    dmlUpdates;
    isActive;
    description;
    type;
    createdDate;
    lastModifiedDate;
    sobject;
    triggerType;

    constructor(setup) {
        super();
        super.initData(setup);
    }
}