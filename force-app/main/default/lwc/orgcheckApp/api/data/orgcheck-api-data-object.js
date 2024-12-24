// @ts-check

import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_Object extends OrgCheckData {
    
    /**
     * @description Salesforce Id
     * @type {string}
     * @public
     */
    id;
    
    label;
    labelPlural;
    isCustom;
    isFeedEnabled;
    isMostRecentEnabled;
    isSearchable;
    keyPrefix;
    
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name;
    
    api
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name;
    
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
    typeId;
    typeRef;
    description;
    externalSharingModel;
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