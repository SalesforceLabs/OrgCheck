import { OrgCheckData } from '../core/orgcheck-api-data';

export class SFDC_ObjectType extends OrgCheckData {
    id;
    label;

    constructor(setup) {
        super();
        super.initData(setup);
    }
}

export const OBJECTTYPE_ID_STANDARD_SOBJECT = 'StandardObject';
export const OBJECTTYPE_ID_CUSTOM_SOBJECT = 'CustomObject';
export const OBJECTTYPE_ID_CUSTOM_EXTERNAL_SOBJECT = 'ExternalObject';
export const OBJECTTYPE_ID_CUSTOM_SETTING = 'CustomSetting';
export const OBJECTTYPE_ID_CUSTOM_METADATA_TYPE = 'CustomMetadataType';
export const OBJECTTYPE_ID_CUSTOM_EVENT = 'CustomEvent';
export const OBJECTTYPE_ID_KNOWLEDGE_ARTICLE = 'KnowledgeArticle';
export const OBJECTTYPE_ID_CUSTOM_BIG_OBJECT = 'CustomBigObject';