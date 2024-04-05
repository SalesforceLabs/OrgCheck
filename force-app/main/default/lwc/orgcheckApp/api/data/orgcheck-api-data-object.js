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
    apexTriggers;
    fieldSets;
    layouts;
    limits;
    validationRules;
    webLinks;
    fields;
    recordTypes;
    relationships;
    recordCount;
}