import { OrgCheckData, OrgCheckDataWithoutScoring } from '../core/orgcheck-api-data';

export class SFDC_ProfileRestrictions extends OrgCheckData {
    profileId;
    profileRef;
    ipRanges;
    loginHours;
}

export class SFDC_ProfileIpRangeRestriction extends OrgCheckDataWithoutScoring {
    startAddress;
    endAddress;
    
    /**
     * @description Full description of that item
     * @type {string}
     * @public
     */
    description;
    difference;
}

export class SFDC_ProfileLoginHourRestriction extends OrgCheckDataWithoutScoring {
    fromTime;
    toTime;
    day;
    difference;
}

