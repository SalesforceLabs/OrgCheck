import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_Workflow extends OrgCheckData {
    id;
    name;
    url;
    description;
    actions;
    futureActions;
    emptyTimeTriggers;
    isActive;
    createdDate;
    lastModifiedDate;
    hasAction;
}