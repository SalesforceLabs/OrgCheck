import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_VisualForceComponent extends OrgCheckData {
    id;
    name;
    apiVersion;
    package;
    createdDate;
    lastModifiedDate;
    description;
    url;

    constructor(setup) {
        super();
        super.initData(setup);
    }
}