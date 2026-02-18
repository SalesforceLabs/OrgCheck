import { DataAliases } from '../core/orgcheck-api-data-aliases';
import { DataWithScore } from '../core/orgcheck-api-data';
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
import { SFDC_Workflow } from './orgcheck-api-data-workflow';

/**
 * @description Representation of as SObject in Org Check
 */
export interface SFDC_Object extends DataWithScore {
    
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_Object;
        
     /**
     * @description Salesforce Id
     * @type {string}
     * @public
     */
    id: string;
    
    /**
     * @description Label of this object
     * @type {string}
     * @public
     */
    label: string;

    /**
     * @description Plural label of this object
     * @type {string}
     * @public
     */
    labelPlural: string;

    /**
     * @description Whether this object is custom or not
     * @type {boolean}
     * @public
     */
    isCustom: boolean;
    
    /**
     * @description Whether this object has feed enabled or not
     * @type {boolean}
     * @public
     */
    isFeedEnabled: boolean;
    
    /**
     * @description Whether this object has MRU enabled or not
     * @type {boolean}
     * @public
     */
    isMostRecentEnabled: boolean;
    
    /**
     * @description Whether this object has search enabled or not
     * @type {boolean}
     * @public
     */
    isSearchable: boolean;
    
    /**
     * @description Prefix for this object (the three first digits of every record's salesforce id from this sobject)
     * @type {string}
     * @public
     */
    keyPrefix: string;
    
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name: string;
    
    /**
     * @description API name
     * @type {string}
     * @public
     */
    apiname: string;
    
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url: string;
    
    /**
     * @description Name of the potential namespace/package where this item comes from. Empty string if none.
     * @type {string}
     * @public
     */
    package: string;

    /**
     * @description Id of the type of this object
     * @type {string}
     * @public
     */
    typeId: string;

    /**
     * @description Reference of the type of this object
     * @type {SFDC_ObjectType}
     * @public
     */
    typeRef: SFDC_ObjectType;
    
    /**
     * @description Full description of that item
     * @type {string}
     * @public
     */
    description: string;

    /**
     * @description External OWD 
     * @type {string}
     * @public
     */
    externalSharingModel: string;
    
    /**
     * @description Internal OWD 
     * @type {string}
     * @public
     */
    internalSharingModel: string;
    
    /**
     * @description List of Apex Triggers ids for this object
     * @type {Array<string>}
     * @public
     */
    apexTriggerIds: Array<string>;
    
    /**
     * @description Corresponding Apex Trigger references fot this object
     * @type {Array<SFDC_ApexTrigger>}
     * @public
     */
    apexTriggerRefs: Array<SFDC_ApexTrigger>;

    /**
     * @description Number of apex triggers (active or not) for this object
     * @type {number}
     * @public
     */
    nbApexTriggers: number;
    
    /**
     * @description List of field Sets for this object
     * @type {Array<SFDC_FieldSet>}
     * @public
     */
    fieldSets: Array<SFDC_FieldSet>;
    
    /**
     * @description List of layouts for this object
     * @type {Array<SFDC_PageLayout>}
     * @public
     */
    layouts: Array<SFDC_PageLayout>;

    /**
     * @description Number of page layouts for this object
     * @type {number}
     * @public
     */
    nbPageLayouts: number;

    /**
     * @description List of Ligthning Pages for this object
     * @type {Array<SFDC_LightningPage>}
     * @public
     */
    flexiPages: Array<SFDC_LightningPage>;
    
    /**
     * @description Limits for this object
     * @type {Array<SFDC_Limit>}
     * @public
     */
    limits: Array<SFDC_Limit>;
    
    /**
     * @description List of validation rules for this object
     * @type {Array<SFDC_ValidationRule>}
     * @public
     */
    validationRules: Array<SFDC_ValidationRule>;

    /**
     * @description Number of validation rules for this object
     * @type {number}
     * @public
     */ 
    nbValidationRules: number;
    
    /**
     * @description List of web links for this object
     * @type {Array<SFDC_WebLink>}
     * @public
     */
    webLinks: Array<SFDC_WebLink>;
    
    /**
     * @description List of standard fields for this object
     * @type {Array<SFDC_Field>}
     * @public
     */
    standardFields: Array<SFDC_Field>;
    
    /**
     * @description List of custom field Ids for this object
     * @type {Array<string>}
     * @public
     */
    customFieldIds: Array<string>;

    /**
     * @description Number of custom fields for this object
     * @type {number}
     * @public
     */
    nbCustomFields: number;
    
    /**
     * @description List of custom field references for this object
     * @type {Array<SFDC_Field>}
     * @public
     */
    customFieldRefs: Array<SFDC_Field>;
    
    /**
     * @description List of record types for this object
     * @type {Array<SFDC_RecordType>}
     * @public
     */
    recordTypes: Array<SFDC_RecordType>;
    
    /**
     * @description Number of record types for this object
     * @type {number}
     * @public
     */
    nbRecordTypes: number;

    /**
     * @description List of Workflow Rules ids for this object
     * @type {Array<string>}
     * @public
     */
    workflowRuleIds: Array<string>;
    
    /**
     * @description Corresponding Workflow Rules references fot this object
     * @type {Array<SFDC_Workflow>}
     * @public
     */
    workflowRuleRefs: Array<SFDC_Workflow>;

    /**
     * @description Number of workflow rules for this object
     * @type {number}
     * @public
     */ 
    nbWorkflowRules: number;

    /**
     * @description List of relationships for this object
     * @type {Array<SFDC_ObjectRelationShip>}
     * @public
     */
    relationships: Array<SFDC_ObjectRelationShip>;
    
    /**
     * @description Number of records for this object (including deleted ones)
     * @type {number}
     * @public
     */
    recordCount: number;
}