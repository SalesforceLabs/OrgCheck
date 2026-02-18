import { DataAliases } from '../core/orgcheck-api-data-aliases';
import { DataWithScore } from '../core/orgcheck-api-data';

/**
 * @description Representation of a browser used by salesforce users while visiting the "Application" in this org
 */
export interface SFDC_Browser extends DataWithScore {
    
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_Browser;

     /**
     * @description full name of the browser as it appears in LoginHistory (name + version)
     * @type {string}
     * @public
     */
    fullName: string;

    /**
     * @description Name of the browser
     * @type {string}
     * @public
     */
    name: string;

    /**
     * @description Version (as a number) of the browser
     * @type {number}
     * @public
     */
    version: number;

    /**
     * @description Number of "application" logins with this browser in LoginHistory
     * @type {number}
     * @public
     */
    nbApplicationLogin: number;
}