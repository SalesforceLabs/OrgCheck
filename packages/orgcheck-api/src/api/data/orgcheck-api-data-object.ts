import { DataAliases } from 'src/api/core/orgcheck-api-data-aliases';
import { DataWithScore } from 'src/api/core/orgcheck-api-data';
import { SfdcApexTrigger } from 'src/api/data/orgcheck-api-data-apextrigger';
import { SfdcField } from 'src/api/data/orgcheck-api-data-field';
import { SfdcFieldSet } from 'src/api/data/orgcheck-api-data-fieldset';
import { SfdcLightningPage } from 'src/api/data/orgcheck-api-data-lightningpage';
import { SfdcLimit } from 'src/api/data/orgcheck-api-data-limit';
import { SfdcObjectRelationShip } from 'src/api/data/orgcheck-api-data-objectrelationship';
import { SfdcObjectType } from 'src/api/data/orgcheck-api-data-objecttype';
import { SfdcPageLayout } from 'src/api/data/orgcheck-api-data-pagelayout';
import { SfdcRecordType } from 'src/api/data/orgcheck-api-data-recordtype';
import { SfdcValidationRule } from 'src/api/data/orgcheck-api-data-validationrule';
import { SfdcWebLink } from 'src/api/data/orgcheck-api-data-weblink';
import { SfdcWorkflow } from 'src/api/data/orgcheck-api-data-workflow';

/**
 * @description Representation of as SObject in Org Check
 */
export interface SfdcObject extends DataWithScore {
    
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SfdcObject;
        
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
     * @type {SfdcObjectType}
     * @public
     */
    typeRef: SfdcObjectType;
    
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
     * @type {Array<SfdcApexTrigger>}
     * @public
     */
    apexTriggerRefs: Array<SfdcApexTrigger>;

    /**
     * @description Number of apex triggers (active or not) for this object
     * @type {number}
     * @public
     */
    nbApexTriggers: number;
    
    /**
     * @description List of field Sets for this object
     * @type {Array<SfdcFieldSet>}
     * @public
     */
    fieldSets: Array<SfdcFieldSet>;
    
    /**
     * @description List of layouts for this object
     * @type {Array<SfdcPageLayout>}
     * @public
     */
    layouts: Array<SfdcPageLayout>;

    /**
     * @description Number of page layouts for this object
     * @type {number}
     * @public
     */
    nbPageLayouts: number;

    /**
     * @description List of Ligthning Pages for this object
     * @type {Array<SfdcLightningPage>}
     * @public
     */
    flexiPages: Array<SfdcLightningPage>;
    
    /**
     * @description Limits for this object
     * @type {Array<SfdcLimit>}
     * @public
     */
    limits: Array<SfdcLimit>;
    
    /**
     * @description List of validation rules for this object
     * @type {Array<SfdcValidationRule>}
     * @public
     */
    validationRules: Array<SfdcValidationRule>;

    /**
     * @description Number of validation rules for this object
     * @type {number}
     * @public
     */ 
    nbValidationRules: number;
    
    /**
     * @description List of web links for this object
     * @type {Array<SfdcWebLink>}
     * @public
     */
    webLinks: Array<SfdcWebLink>;
    
    /**
     * @description List of standard fields for this object
     * @type {Array<SfdcField>}
     * @public
     */
    standardFields: Array<SfdcField>;
    
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
     * @type {Array<SfdcField>}
     * @public
     */
    customFieldRefs: Array<SfdcField>;
    
    /**
     * @description List of record types for this object
     * @type {Array<SfdcRecordType>}
     * @public
     */
    recordTypes: Array<SfdcRecordType>;
    
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
     * @type {Array<SfdcWorkflow>}
     * @public
     */
    workflowRuleRefs: Array<SfdcWorkflow>;

    /**
     * @description Number of workflow rules for this object
     * @type {number}
     * @public
     */ 
    nbWorkflowRules: number;

    /**
     * @description List of relationships for this object
     * @type {Array<SfdcObjectRelationShip>}
     * @public
     */
    relationships: Array<SfdcObjectRelationShip>;
    
    /**
     * @description Number of records for this object (including deleted ones)
     * @type {number}
     * @public
     */
    recordCount: number;
}