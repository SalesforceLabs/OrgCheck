import { DataWithoutScoring } from '../core/orgcheck-api-data';

export class SFDC_ObjectType extends DataWithoutScoring {
    
    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'SObject Types' };

    /**
     * @description Technical representation of this type
     * @type {string}
     * @public
     */
    id;
    
    /**
     * @description Label of the type
     * @type {string}
     * @public
     */
    label;
}

export const OBJECTTYPE_ID_STANDARD_SOBJECT = 'StandardEntity';
export const OBJECTTYPE_ID_CUSTOM_SOBJECT = 'CustomObject';
export const OBJECTTYPE_ID_CUSTOM_EXTERNAL_SOBJECT = 'ExternalObject';
export const OBJECTTYPE_ID_CUSTOM_SETTING = 'CustomSetting';
export const OBJECTTYPE_ID_CUSTOM_METADATA_TYPE = 'CustomMetadataType';
export const OBJECTTYPE_ID_CUSTOM_EVENT = 'CustomEvent';
export const OBJECTTYPE_ID_KNOWLEDGE_ARTICLE = 'KnowledgeArticle';
export const OBJECTTYPE_ID_CUSTOM_BIG_OBJECT = 'CustomBigObject';