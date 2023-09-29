export class SFDC_ObjectType {
    id;
    label;
    constructor(setup) { MAP_FIELDS_FROM_SETUP(setup, this); }
}

export const OBJECTTYPE_ID_STANDARD_SOBJECT = 'StandardObject';
export const OBJECTTYPE_ID_CUSTOM_SOBJECT = 'CustomObject';
export const OBJECTTYPE_ID_CUSTOM_EXTERNAL_SOBJECT = 'ExternalObject';
export const OBJECTTYPE_ID_CUSTOM_SETTING = 'CustomSetting';
export const OBJECTTYPE_ID_CUSTOM_METADATA_TYPE = 'CustomMetadataType';
export const OBJECTTYPE_ID_CUSTOM_EVENT = 'CustomEvent';
export const OBJECTTYPE_ID_KNOWLEDGE_ARTICLE = 'KnowledgeArticle';
export const OBJECTTYPE_ID_CUSTOM_BIG_OBJECT = 'CustomBigObject';