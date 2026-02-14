
import { Data } from '../core/orgcheck-api-data';

export class SFDC_Report extends Data {

    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Report' };

    /**
     * @description Unique identifier of this report in the org.
     * @type {string}
     * @public
     */
    id: string;

    /**
     * @description Name of the report.
     * @type {string}
     * @public
     */
    name: string;

    /**
     * @description Developer name of the report.
     * @type {string}
     * @public
     */
    developerName: string;

    /**
     * @description Format of the report (e.g. Tabular, Summary, Matrix, Joined).
     * @type {string}
     * @public
     */
    format: string;

    /**
     * @description Description of the report.
     * @type {string}
     * @public
     */
    description: string;

    /**
     * @description Date/Time when this item was created in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    createdDate: number;
    
    /**
     * @description Date/Time when this item was last modified in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastModifiedDate: number;

    /**
     * @description Date/Time when this report was last run in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastRunDate: number;
    
    /**
     * @description Date/Time when this report was last viewed in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastViewedDate: number;
    
    /**
     * @description Date/Time when this report was last referenced in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastReferencedDate: number;

    /**
     * @description Name of the folder where this report is stored.
     * @type {string}
     * @public
     */
    folderName: string;

    /**
     * @description Url to the report in the setup of the org.
     * @type {string}
     * @public
     */
    url: string;

    /**
     * @description Name of the package where this report is stored.
     * @type {string}
     * @public
     */
    package: string;
}