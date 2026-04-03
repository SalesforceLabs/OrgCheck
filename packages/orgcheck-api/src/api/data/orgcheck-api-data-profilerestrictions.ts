import { DataAliases } from 'src/api/core/data/orgcheck-api-data-aliases';
import { DataWithScore, DataWithoutScore } from 'src/api/core/data/orgcheck-api-data';
import { SfdcProfile } from 'src/api/data/orgcheck-api-data-profile';

export interface SfdcProfileRestrictions extends DataWithScore {
    
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SfdcProfileRestrictions;

     /**
     * @description Salesforce Id of the corresponding Profile
     * @type {string}
     * @public
     */
    profileId: string;

    /**
     * @description Reference to the corresponding Profile
     * @type {SfdcProfile}
     * @public
     */
    profileRef: SfdcProfile;

    /**
     * @description IP Range Restriction list for this profile
     * @type {SfdcProfileIpRangeRestriction[]}
     * @public
     */
    ipRanges: SfdcProfileIpRangeRestriction[];

    /**
     * @description Login Hour Restriction list for this profile
     * @type {SfdcProfileLoginHourRestriction[]}
     * @public
     */
    loginHours: SfdcProfileLoginHourRestriction[];
}

export interface SfdcProfileIpRangeRestriction extends DataWithoutScore {
    
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SfdcProfileIpRangeRestriction;

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

export interface SfdcProfileLoginHourRestriction extends DataWithoutScore {
    
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SfdcProfileLoginHourRestriction;

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

