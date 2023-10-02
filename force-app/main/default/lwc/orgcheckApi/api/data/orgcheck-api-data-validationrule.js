import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_ValidationRule extends OrgCheckData {
    id;
    name;
    isActive;
    description;
    errorDisplayField;
    errorMessage;
    url;

    constructor(setup) {
        super();
        super.initData(setup);
    }
}