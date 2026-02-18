import { DataWithoutScore } from '../core/orgcheck-api-data';
import { DataAliases } from '../core/orgcheck-api-data-aliases';

export interface SFDC_ObjectType extends DataWithoutScore {
    
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_ObjectType;
        
     /**
     * @description Technical representation of this type
     * @type {string}
     * @public
     */
    id: string;
    
    /**
     * @description Label of the type
     * @type {string}
     * @public
     */
    label: string;
}

export const OBJECTTYPE_ID_STANDARD_SOBJECT = 'StandardEntity';
export const OBJECTTYPE_ID_CUSTOM_SOBJECT = 'CustomObject';
export const OBJECTTYPE_ID_CUSTOM_EXTERNAL_SOBJECT = 'ExternalObject';
export const OBJECTTYPE_ID_CUSTOM_SETTING = 'CustomSetting';
export const OBJECTTYPE_ID_CUSTOM_METADATA_TYPE = 'CustomMetadataType';
export const OBJECTTYPE_ID_CUSTOM_EVENT = 'CustomEvent';
export const OBJECTTYPE_ID_KNOWLEDGE_ARTICLE = 'KnowledgeArticle';
export const OBJECTTYPE_ID_CUSTOM_BIG_OBJECT = 'CustomBigObject';