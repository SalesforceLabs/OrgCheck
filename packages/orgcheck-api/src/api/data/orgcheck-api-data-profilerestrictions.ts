import { Data, DataWithoutScoring } from '../core/orgcheck-api-data';
import { SFDC_Profile } from './orgcheck-api-data-profile';

export class SFDC_ProfileRestrictions extends Data {

    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Restrictions from Profile' };

    /**
     * @description Salesforce Id of the corresponding Profile
     * @type {string}
     * @public
     */
    profileId: string;

    /**
     * @description Reference to the corresponding Profile
     * @type {SFDC_Profile}
     * @public
     */
    profileRef: SFDC_Profile;

    /**
     * @description IP Range Restriction list for this profile
     * @type {Array<SFDC_ProfileIpRangeRestriction>}
     * @public
     */
    ipRanges: Array<SFDC_ProfileIpRangeRestriction>;

    /**
     * @description Login Hour Restriction list for this profile
     * @type {Array<SFDC_ProfileLoginHourRestriction>}
     * @public
     */
    loginHours: Array<SFDC_ProfileLoginHourRestriction>;
}

export class SFDC_ProfileIpRangeRestriction extends DataWithoutScoring {

    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'IP Range Restriction from Profile' };

    /**
     * @description Start IP address
     * @type {string}
     * @public
     */
    startAddress: string;

    /**
     * @description End IP address
     * @type {string}
     * @public
     */
    endAddress: string;
    
    /**
     * @description Full description of that item
     * @type {string}
     * @public
     */
    description: string;

    /**
     * @description Number of IP addresses in this range (= end - start)
     * @type {number}
     * @public
     */
    difference: number;
}

export class SFDC_ProfileLoginHourRestriction extends DataWithoutScoring {

    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Login Hour Restriction from Profile' };

    /**
     * @description Starting hour of the restriction (HH:MM format)
     * @type {string}
     * @public
     */
    fromTime: string;

    /**
     * @description Ending hour of the restriction (HH:MM format)
     * @type {string}
     * @public
     */
    toTime: string;

    /**
     * @description Label of the week day
     * @type {string}
     * @public
     */
    day: string;

    /**
     * @description Number of hours in this range (= toTime - fromTime)
     * @type {number}
     * @public
     */
    difference: number;
}

