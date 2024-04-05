import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_ProfileIpRangeRestriction extends OrgCheckData {
    startAddress;
    endAddress;
    description;
    difference;
}

export class SFDC_ProfileLoginHourRestriction extends OrgCheckData {
    fromTime;
    toTime;
    day;
    difference;
}

export class SFDC_ProfileRestrictions extends OrgCheckData {
    profileId;
    profileRef;
    ipRanges;
    loginHours;
}