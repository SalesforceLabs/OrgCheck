import { DataAliases } from 'src/api/core/data/orgcheck-api-data-aliases';
import { DataWithScore } from 'src/api/core/data/orgcheck-api-data';
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
     * @description API name
     * @type {string}
     * @public
     */
    apiname: string;
    
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
     * @type {string[]}
     * @public
     */
    apexTriggerIds: string[];
    
    /**
     * @description Corresponding Apex Trigger references fot this object
     * @type {SfdcApexTrigger[]}
     * @public
     */
    apexTriggerRefs: SfdcApexTrigger[];

    /**
     * @description Number of apex triggers (active or not) for this object
     * @type {number}
     * @public
     */
    nbApexTriggers: number;
    
    /**
     * @description List of field Sets for this object
     * @type {SfdcFieldSet[]}
     * @public
     */
    fieldSets: SfdcFieldSet[];
    
    /**
     * @description List of layouts for this object
     * @type {SfdcPageLayout[]}
     * @public
     */
    layouts: SfdcPageLayout[];

    /**
     * @description Number of page layouts for this object
     * @type {number}
     * @public
     */
    nbPageLayouts: number;

    /**
     * @description List of Ligthning Pages for this object
     * @type {SfdcLightningPage[]}
     * @public
     */
    flexiPages: SfdcLightningPage[];
    
    /**
     * @description Limits for this object
     * @type {SfdcLimit[]}
     * @public
     */
    limits: SfdcLimit[];
    
    /**
     * @description List of validation rules for this object
     * @type {SfdcValidationRule[]}
     * @public
     */
    validationRules: SfdcValidationRule[];

    /**
     * @description Number of validation rules for this object
     * @type {number}
     * @public
     */ 
    nbValidationRules: number;
    
    /**
     * @description List of web links for this object
     * @type {SfdcWebLink[]}
     * @public
     */
    webLinks: SfdcWebLink[];
    
    /**
     * @description List of standard fields for this object
     * @type {SfdcField[]}
     * @public
     */
    standardFields: SfdcField[];
    
    /**
     * @description List of custom field Ids for this object
     * @type {string[]}
     * @public
     */
    customFieldIds: string[];

    /**
     * @description Number of custom fields for this object
     * @type {number}
     * @public
     */
    nbCustomFields: number;
    
    /**
     * @description List of custom field references for this object
     * @type {SfdcField[]}
     * @public
     */
    customFieldRefs: SfdcField[];
    
    /**
     * @description List of record types for this object
     * @type {SfdcRecordType[]}
     * @public
     */
    recordTypes: SfdcRecordType[];
    
    /**
     * @description Number of record types for this object
     * @type {number}
     * @public
     */
    nbRecordTypes: number;

    /**
     * @description List of Workflow Rules ids for this object
     * @type {string[]}
     * @public
     */
    workflowRuleIds: string[];
    
    /**
     * @description Corresponding Workflow Rules references fot this object
     * @type {SfdcWorkflow[]}
     * @public
     */
    workflowRuleRefs: SfdcWorkflow[];

    /**
     * @description Number of workflow rules for this object
     * @type {number}
     * @public
     */ 
    nbWorkflowRules: number;

    /**
     * @description List of relationships for this object
     * @type {SfdcObjectRelationShip[]}
     * @public
     */
    relationships: SfdcObjectRelationShip[];
    
    /**
     * @description Number of records for this object (including deleted ones)
     * @type {number}
     * @public
     */
    recordCount: number;
}