import { DataAliases } from '../core/orgcheck-api-data-aliases';
import { DataWithScoreAndDependencies } from '../core/orgcheck-api-data';
import { SFDC_Object } from './orgcheck-api-data-object';

/**
 * @description Representation of a Standard Field or a Custom Field in Org Check
 */
export interface SFDC_Field extends DataWithScoreAndDependencies {
    
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_Field;

    /**
     * @description Salesforce Id
     * @type {string}
     * @public
     */
    id: string;
    
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url: string;
    
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name: string;
    
    /**
     * @description Label
     * @type {string}
     * @public
     */
    label: string;
    
    /**
     * @description Name of the potential namespace/package where this item comes from. Empty string if none.
     * @type {string}
     * @public
     */
    package: string;
    
    /**
     * @description Full description of that item
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
     * @description Salesforce Id of the sObject where this field is defined
     * @type {string}
     * @public
     */
    objectId: string; 

    /**
     * @description Reference of the object for this field
     * @type {SFDC_Object}
     * @public
     */
    objectRef: SFDC_Object;

    /**
     * @description Is tgis field custom or standard
     * @type {boolean}
     * @public
     */
    isCustom: boolean;

    /**
     * @description Tooltip
     * @type {string}
     * @public
     */
    tooltip: string;

    /**
     * @description Type of this field
     * @type {string}
     * @public
     */
    type: string;

    /**
     * @description Length of this field in addition to its type
     * @type {number}
     * @public
     */
    length: number;

    /**
     * @description Is this field unique?
     * @type {boolean}
     * @public
     */
    isUnique: boolean;

    /**
     * @description Is this field encrypted?
     * @type {boolean}
     * @public
     */
    isEncrypted: boolean;

    /**
     * @description Is this field set as an external id?
     * @type {boolean}
     * @public
     */
    isExternalId: boolean;

    /**
     * @description Is this field uses an index in the table?
     * @type {boolean}
     * @public
     */
    isIndexed: boolean;

    /**
     * @description Default value
     * @type {string}
     * @public
     */
    defaultValue: string;

    /**
     * @description If this is a picklist, is it restricted to a list of values?
     * @type {boolean}
     * @public
     */
    isRestrictedPicklist: boolean;

    /**
     * @description What is the formula of that field? (obviously only for formula field!)
     * @type {string}
     * @public
     */
    formula: string;

    /**
     * @description Only for formula field -- List of unique hard coded Salesforce URLs in the formula
     * @type {Array<string>}
     * @public
     */
    hardCodedURLs: Array<string>;

    /**
     * @description Only for formula field -- List of unique hard coded Salesforce IDs in the formula
     * @type {Array<string>}
     * @public
     */
    hardCodedIDs: Array<string>;

}