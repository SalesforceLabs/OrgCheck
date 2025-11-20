
import { Data } from '../core/orgcheck-api-data';

export class SFDC_Dashboard extends Data {

    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Dasboard' };

    /**
     * @description Unique identifier of this dashboard in the org.
     * @type {string}
     * @public
     */
    id;

    /**
     * @description Title of the dashboard.
     * @type {string}
     * @public
     */
    title;

    /**
     * @description Developer name of the dashboard.
     * @type {string}
     * @public
     */
    developerName;

    /**
     * @description Type of the dashboard.
     * @type {string}
     * @public
     */
    type;

    /**
     * @description Description of the dashboard.
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
     * @description Date/Time when this dashboard was last viewed in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastViewedDate;

    /**
     * @description Date/Time when this dashboard was last referenced in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastReferencedDate;
    
    /**
     * @description Date/Time when this dashboard's result was last refreshed in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    resultRefreshedDate;

    /**
     * @description Name of the folder where this dashboard is stored.
     * @type {string}
     * @public
     */
    folderName;

    /**
     * @description Url to the dashboard in the setup of the org.
     * @type {string}
     * @public
     */
    url;

    /**
     * @description Name of the package where this dashboard is stored.
     * @type {string}
     * @public
     */
    package;
}