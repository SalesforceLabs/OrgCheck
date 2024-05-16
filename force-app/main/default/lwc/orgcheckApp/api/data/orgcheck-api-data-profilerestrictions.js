import { OrgCheckData, OrgCheckInnerData } from '../core/orgcheck-api-data';

export class SFDC_ProfileRestrictions extends OrgCheckData {
    profileId;
    profileRef;
    ipRanges;
    loginHours;
}

export class SFDC_ProfileIpRangeRestriction extends OrgCheckInnerData {
    startAddress;
    endAddress;
    description;
    difference;
}

export class SFDC_ProfileLoginHourRestriction extends OrgCheckInnerData {
    fromTime;
    toTime;
    day;
    difference;
}

