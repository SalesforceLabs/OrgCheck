import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_Limit extends OrgCheckData {
    id;
    label;
    remaining;
    max;
    used;
    usedPercentage;
    type;
}