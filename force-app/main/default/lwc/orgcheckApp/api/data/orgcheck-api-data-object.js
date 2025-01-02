import { OrgCheckDataWithoutScoring } from '../core/orgcheck-api-data';
import { SFDC_ObjectType } from './orgcheck-api-data-objecttype';

/**
 * @description Representation of as SObject in Org Check
 */
export class SFDC_Object extends OrgCheckDataWithoutScoring {
    
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

    isCustom;
    
    isFeedEnabled;
    
    isMostRecentEnabled;
    
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
    
    apexTriggerIds;
    
    apexTriggerRefs;
    
    fieldSets;
    
    layouts;
    
    limits;
    
    validationRules;
    
    webLinks;
    
    standardFields;
    
    customFieldIds;
    
    customFieldRefs;
    
    recordTypes;
    
    relationships;
    
    recordCount;
}