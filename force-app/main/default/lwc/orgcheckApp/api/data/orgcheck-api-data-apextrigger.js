import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_ApexTrigger extends OrgCheckData {
    id;
    name;
    url;
    apiVersion;
    package;
    length;
    isActive;
    beforeInsert;
    afterInsert;
    beforeUpdate;
    afterUpdate;
    beforeDelete;
    afterDelete;
    afterUndelete;
    objectId; 
    objectRef;
    hasSOQL;
    hasDML;
    createdDate;
    lastModifiedDate;
}