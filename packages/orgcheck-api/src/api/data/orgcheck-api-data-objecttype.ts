import { DataWithoutScore } from 'src/api/core/data/orgcheck-api-data';
import { DataAliases } from 'src/api/core/data/orgcheck-api-data-aliases';

export interface SfdcObjectType extends DataWithoutScore {
    
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SfdcObjectType;

    /**
     * @description Label of the type
     * @type {string}
     * @public
     */
    label: string;
}

/**
 * @description Data aliases
 */
export enum SObjectTypes {
    STANDARD_SOBJECT = 'StandardEntity',
    CUSTOM_SOBJECT = 'CustomObject',
    CUSTOM_EXTERNAL_SOBJECT = 'ExternalObject',
    CUSTOM_SETTING = 'CustomSetting',
    CUSTOM_METADATA_TYPE = 'CustomMetadataType',
    CUSTOM_EVENT = 'CustomEvent',
    KNOWLEDGE_ARTICLE = 'KnowledgeArticle',
    CUSTOM_BIG_OBJECT = 'CustomBigObject'
}
