import { Data } from '../core/orgcheck-api-data';
import { SFDC_ApexTrigger } from './orgcheck-api-data-apextrigger';
import { SFDC_Field } from './orgcheck-api-data-field';
import { SFDC_FieldSet } from './orgcheck-api-data-fieldset';
import { SFDC_LightningPage } from './orgcheck-api-data-lightningpage';
import { SFDC_Limit } from './orgcheck-api-data-limit';
import { SFDC_ObjectRelationShip } from './orgcheck-api-data-objectrelationship';
import { SFDC_ObjectType } from './orgcheck-api-data-objecttype';
import { SFDC_PageLayout } from './orgcheck-api-data-pagelayout';
import { SFDC_RecordType } from './orgcheck-api-data-recordtype';
import { SFDC_ValidationRule } from './orgcheck-api-data-validationrule';
import { SFDC_WebLink } from './orgcheck-api-data-weblink';

/**
 * @description Representation of as SObject in Org Check
 */
export class SFDC_Object extends Data {
    
    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'SObject' };

    /**
     * @description Salesforce Id
     * @type {string}
     * @public
     */
    id;
    
    /**
     * @description Label of this object
     * @type {string}
     * @public
     */
    label;

    /**
     * @description Plural label of this object
     * @type {string}
     * @public
     */
    labelPlural;

    /**
     * @description Whether this object is custom or not
     * @type {boolean}
     * @public
     */
    isCustom;
    
    /**
     * @description Whether this object has feed enabled or not
     * @type {boolean}
     * @public
     */
    isFeedEnabled;
    
    /**
     * @description Whether this object has MRU enabled or not
     * @type {boolean}
     * @public
     */
    isMostRecentEnabled;
    
    /**
     * @description Whether this object has search enabled or not
     * @type {boolean}
     * @public
     */
    isSearchable;
    
    /**
     * @description Prefix for this object (the three first digits of every record's salesforce id from this sobject)
     * @type {string}
     * @public
     */
    keyPrefix;
    
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name;
    
    /**
     * @description API name
     * @type {string}
     * @public
     */
    apiname;
    
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url;
    
    /**
     * @description Name of the potential namespace/package where this item comes from. Empty string if none.
     * @type {string}
     * @public
     */
    package;

    /**
     * @description Id of the type of this object
     * @type {string}
     * @public
     */
    typeId;

    /**
     * @description Reference of the type of this object
     * @type {SFDC_ObjectType}
     * @public
     */
    typeRef;
    
    /**
     * @description Full description of that item
     * @type {string}
     * @public
     */
    description;

    /**
     * @description External OWD 
     * @type {string}
     * @public
     */
    externalSharingModel;
    
    /**
     * @description Internal OWD 
     * @type {string}
     * @public
     */
    internalSharingModel;
    
    /**
     * @description List of Apex Triggers ids for this object
     * @type {Array<string>}
     * @public
     */
    apexTriggerIds;
    
    /**
     * @description Corresponding Apex Trigger references fot this object
     * @type {Array<SFDC_ApexTrigger>}
     * @public
     */
    apexTriggerRefs;
    
    /**
     * @description List of field Sets for this object
     * @type {Array<SFDC_FieldSet>}
     * @public
     */
    fieldSets;
    
    /**
     * @description List of layouts for this object
     * @type {Array<SFDC_PageLayout>}
     * @public
     */
    layouts;

    /**
     * @description Number of page layouts for this object
     * @type {number}
     * @public
     */
    nbPageLayouts;

    /**
     * @description List of Ligthning Pages for this object
     * @type {Array<SFDC_LightningPage>}
     * @public
     */
    flexiPages;
    
    /**
     * @description Limits for this object
     * @type {Array<SFDC_Limit>}
     * @public
     */
    limits;
    
    /**
     * @description List of validation rules for this object
     * @type {Array<SFDC_ValidationRule>}
     * @public
     */
    validationRules;

    /**
     * @description Number of validation rules for this object
     * @type {number}
     * @public
     */ 
    nbValidationRules;
    
    /**
     * @description List of web links for this object
     * @type {Array<SFDC_WebLink>}
     * @public
     */
    webLinks;
    
    /**
     * @description List of standard fields for this object
     * @type {Array<SFDC_Field>}
     * @public
     */
    standardFields;
    
    /**
     * @description List of custom field Ids for this object
     * @type {Array<string>}
     * @public
     */
    customFieldIds;

    /**
     * @description Number of custom fields for this object
     * @type {number}
     * @public
     */
    nbCustomFields;
    
    /**
     * @description List of custom field references for this object
     * @type {Array<SFDC_Field>}
     * @public
     */
    customFieldRefs;
    
    /**
     * @description List of record types for this object
     * @type {Array<SFDC_RecordType>}
     * @public
     */
    recordTypes;
    
    /**
     * @description Number of record types for this object
     * @type {number}
     * @public
     */
    nbRecordTypes;

    /**
     * @description Number of workflow rules for this object
     * @type {number}
     * @public
     */ 
    nbWorkflowRules;

    /**
     * @description List of relationships for this object
     * @type {Array<SFDC_ObjectRelationShip>}
     * @public
     */
    relationships;
    
    /**
     * @description Number of records for this object (including deleted ones)
     * @type {number}
     * @public
     */
    recordCount;
}