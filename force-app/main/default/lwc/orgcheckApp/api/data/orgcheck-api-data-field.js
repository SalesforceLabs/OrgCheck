import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_Field extends OrgCheckData {
    id;
    url;
    name;
    label;
    package;
    description;
    createdDate;
    lastModifiedDate;
    objectId; 
    objectRef;
    isCustom;
    tooltip;
    type;
    length;
    isUnique;
    isEncrypted;
    isExternalId;
    isIndexed;
    defaultValue;
    formula;
}