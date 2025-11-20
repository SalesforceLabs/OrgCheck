
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
    id;

    /**
     * @description Name of the report.
     * @type {string}
     * @public
     */
    name;

    /**
     * @description Developer name of the report.
     * @type {string}
     * @public
     */
    developerName;

    /**
     * @description Format of the report (e.g. Tabular, Summary, Matrix, Joined).
     * @type {string}
     * @public
     */
    format;

    /**
     * @description Description of the report.
     * @type {string}
     * @public
     */
    description;

    /**
     * @description Date/Time when this item was created in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    createdDate;
    
    /**
     * @description Date/Time when this item was last modified in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastModifiedDate;

    /**
     * @description Date/Time when this report was last run in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastRunDate;
    
    /**
     * @description Date/Time when this report was last viewed in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastViewedDate;
    
    /**
     * @description Date/Time when this report was last referenced in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastReferencedDate;

    /**
     * @description Name of the folder where this report is stored.
     * @type {string}
     * @public
     */
    folderName;

    /**
     * @description Url to the report in the setup of the org.
     * @type {string}
     * @public
     */
    url;

    /**
     * @description Name of the package where this report is stored.
     * @type {string}
     * @public
     */
    package;
}