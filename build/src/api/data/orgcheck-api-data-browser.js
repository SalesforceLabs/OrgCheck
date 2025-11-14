import { Data } from '../core/orgcheck-api-data';

/**
 * @description Representation of a browser used by salesforce users while visiting the "Application" in this org
 */
export class SFDC_Browser extends Data {
    
    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Browser' };

    /**
     * @description full name of the browser as it appears in LoginHistory (name + version)
     * @type {string}
     * @public
     */
    fullName;

    /**
     * @description Name of the browser
     * @type {string}
     * @public
     */
    name;

    /**
     * @description Version (as a number) of the browser
     * @type {number}
     * @public
     */
    version;

    /**
     * @description Number of "application" logins with this browser in LoginHistory
     * @type {number}
     * @public
     */
    nbApplicationLogin;
}