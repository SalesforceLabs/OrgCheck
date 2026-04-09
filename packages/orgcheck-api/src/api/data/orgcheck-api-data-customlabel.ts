import { DataAliases } from 'src/api/core/data/orgcheck-api-data-aliases';
import { DataWithScoreAndDependencies } from 'src/api/core/data/orgcheck-api-data';

/**
 * @description Representation of a Custom Label in Org Check
 */
export interface SfdcCustomLabel extends DataWithScoreAndDependencies {

    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SfdcCustomLabel;
    
    /**
     * @description Name of the potential namespace/package where this item comes from. Empty string if none.
     * @type {string}
     * @public
     */
    package: string;

    /**
     * @description Label
     * @type {string}
     * @public
     */
    label: string;

    /**
     * @description Category
     * @type {string}
     * @public
     */
    category: string;

    /**
     * @description Is this item protected?
     * @type {boolean}
     * @public
     */
    isProtected: boolean;

    /**
     * @description Language code for the label
     * @type {string}
     * @public
     */
    language: string;

    /**
     * @description Value
     * @type {string}
     * @public
     */
    value: string;
    
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
}