
import { DataWithScore } from 'src/api/core/data/orgcheck-api-data';
import { DataAliases } from 'src/api/core/data/orgcheck-api-data-aliases';

export interface SfdcDashboard extends DataWithScore {
    
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SfdcDashboard;

    /**
     * @description Developer name of the dashboard.
     * @type {string}
     * @public
     */
    developerName: string;

    /**
     * @description Type of the dashboard.
     * @type {string}
     * @public
     */
    type: string;

    /**
     * @description Description of the dashboard.
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
     * @description Date/Time when this dashboard was last viewed in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastViewedDate: number;

    /**
     * @description Date/Time when this dashboard was last referenced in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastReferencedDate: number;
    
    /**
     * @description Date/Time when this dashboard's result was last refreshed in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    resultRefreshedDate: number;

    /**
     * @description Name of the folder where this dashboard is stored.
     * @type {string}
     * @public
     */
    folderName: string;

    /**
     * @description Name of the package where this dashboard is stored.
     * @type {string}
     * @public
     */
    package: string;
}