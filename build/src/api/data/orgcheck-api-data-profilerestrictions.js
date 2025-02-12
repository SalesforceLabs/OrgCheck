import { Data, DataWithoutScoring } from '../core/orgcheck-api-data';

export class SFDC_ProfileRestrictions extends Data {

    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Restrictions from Profile' };

    profileId;
    profileRef;
    ipRanges;
    loginHours;
}

export class SFDC_ProfileIpRangeRestriction extends DataWithoutScoring {

    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'IP Range Restriction from Profile' };

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

export class SFDC_ProfileLoginHourRestriction extends DataWithoutScoring {

    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Login Hour Restriction from Profile' };

    fromTime;
    toTime;
    day;
    difference;
}

