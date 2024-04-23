import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_Object extends OrgCheckData {
    id;
    label;
    labelPlural;
    isCustom;
    isFeedEnabled;
    isMostRecentEnabled;
    isSearchable;
    keyPrefix;
    name;
    apiname;
    url;
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