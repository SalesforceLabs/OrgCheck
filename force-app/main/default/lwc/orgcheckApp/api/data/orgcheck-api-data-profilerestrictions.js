import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_ProfileIpRangeRestriction extends OrgCheckData {
    startAddress;
    endAddress;
    description;
    difference;

    constructor(setup) {
        super();
        super.initData(setup);
    }
}

export class SFDC_ProfileLoginHourRestriction extends OrgCheckData {
    fromTime;
    toTime;
    day;
    difference;

    constructor(setup) {
        super();
        super.initData(setup);
    }
}

export class SFDC_ProfileRestrictions extends OrgCheckData {
    profileId;
    profileRef;
    ipRanges;
    loginHours;

    constructor(setup) {
        super();
        super.initData(setup);
    }
}