import { Table, ColumnType, SortOrder, Orientation } from '../libs/orgcheck-ui';
import { SalesforceMetadataTypes, DataMatrix } from '../libs/orgcheck-api';

const PAGELAYOUT = SalesforceMetadataTypes.PAGE_LAYOUT;
const APEXCLASS = SalesforceMetadataTypes.APEX_CLASS;
const FLOWVERSION = SalesforceMetadataTypes.FLOW_VERSION;

export class TableDefinitions {

    /**
     * @description Table definition for field sets (specific to the current selected object)
     * @returns {Table} Field sets table definition
     */ 
    static get FieldSets() { return {
        columns: [
            { label: '#',           type: ColumnType.IDX },
            { label: 'Label',       type: ColumnType.URL, data: { value: 'url', label: 'label' }},
            { label: 'Description', type: ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
        ],
        orderIndex: 1,
        orderSort: SortOrder.ASC
    }};

    /**
     * @description Table definition for page layouts (specific to the current selected object)
     * @returns {Table} Page layouts table definition
     */
    static get Layouts() { return {
        columns: [
            { label: '#',     type: ColumnType.IDX },
            { label: 'Label', type: ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'Type',  type: ColumnType.TXT, data: { value: 'type' }},
        ],
        orderIndex: 1,
        orderSort: SortOrder.ASC
    }};

    /**
     * @description Table definition for object limits (specific to the current selected object)
     * @returns {Table} Object limits table definition
     */
    static get Limits() { return {
        columns: [
            { label: '#',         type: ColumnType.IDX },
            { label: 'Score',     type: ColumnType.SCR, data: { value: 'score', id: 'id', name: 'label' }},
            { label: 'Label',     type: ColumnType.TXT, data: { value: 'label' }},
            { label: 'Type',      type: ColumnType.TXT, data: { value: 'type' }},
            { label: 'Max',       type: ColumnType.NUM, data: { value: 'max' }},
            { label: 'Used',      type: ColumnType.NUM, data: { value: 'used' }},
            { label: 'Used (%)',  type: ColumnType.PRC, data: { value: 'usedPercentage' }},
            { label: 'Remaining', type: ColumnType.NUM, data: { value: 'remaining' }}
        ],
        orderIndex: 1,
        orderSort: SortOrder.DESC
    }};

    /**
     * @description Table definition for validation rules
     * @returns {Table} Validation rules table definition
     */
    static get ValidationRules() { return {
        columns: [
            { label: '#',                type: ColumnType.IDX },
            { label: 'Score',            type: ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',             type: ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'Package',          type: ColumnType.TXT, data: { value: 'package' }},
            { label: 'Object API Name',  type: ColumnType.TXT, data: { value: 'objectId' }}, 
            { label: 'Object Name',      type: ColumnType.URL, data: { value: 'objectRef.url', label: 'objectRef.name' }, modifier: { valueIfEmpty: 'N/A' }}, 
            { label: 'Object Type',      type: ColumnType.TXT, data: { value: 'objectRef.typeRef.label' }, modifier: { valueIfEmpty: 'N/A' }},
            { label: 'Is Active',        type: ColumnType.CHK, data: { value: 'isActive' }},
            { label: 'Display On Field', type: ColumnType.TXT, data: { value: 'errorDisplayField' }},
            { label: 'Error Message',    type: ColumnType.TXT, data: { value: 'errorMessage' }},
            { label: 'Description',      type: ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }},
            { label: 'Created date',     type: ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date',    type: ColumnType.DTM, data: { value: 'lastModifiedDate' }},
        ],
        orderIndex: 1,
        orderSort: SortOrder.DESC
    }};

    /**
     * @description Table definition for validation rules (specific to the current selected object)
     * @returns {Table} Validation rules table definition
     */
    static get ValidationRulesInObject() { return {
        columns: [
            { label: '#',                type: ColumnType.IDX },
            { label: 'Score',            type: ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',             type: ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'Package',          type: ColumnType.TXT, data: { value: 'package' }},
            { label: 'Is Active',        type: ColumnType.CHK, data: { value: 'isActive' }},
            { label: 'Display On Field', type: ColumnType.TXT, data: { value: 'errorDisplayField' }},
            { label: 'Error Message',    type: ColumnType.TXT, data: { value: 'errorMessage' }},
            { label: 'Description',      type: ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }},
            { label: 'Created date',     type: ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date',    type: ColumnType.DTM, data: { value: 'lastModifiedDate' }},
        ],
        orderIndex: 1,
        orderSort: SortOrder.DESC
    }};

    /**
     * @description Table definition for web links (specific to the current selected object)
     * @returns {Table} Web links table definition
     */
    static get WebLinksInObject() { return {
        columns: [
            { label: '#',              type: ColumnType.IDX },
            { label: 'Score',          type: ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',           type: ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'Package',        type: ColumnType.TXT, data: { value: 'package' }},
            { label: 'Hardcoded URLs', type: ColumnType.TXTS, data: { values: 'hardCodedURLs' }},
            { label: 'Hardcoded IDs',  type: ColumnType.TXTS, data: { values: 'hardCodedIDs' }},
            { label: 'Type',           type: ColumnType.TXT, data: { value: 'type' }},
            { label: 'Behavior',       type: ColumnType.TXT, data: { value: 'behavior' }},
            { label: 'Created date',   type: ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date',  type: ColumnType.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Description',    type: ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }},
        ],
        orderIndex: 1,
        orderSort: SortOrder.DESC
    }};

    /**
     * @description Table definition for web links (for all objects)
     * @returns {Table} Web links table definition
     */
    static get WebLinks() { return {
        columns: [
            { label: '#',               type: ColumnType.IDX },
            { label: 'Score',           type: ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',            type: ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'Package',         type: ColumnType.TXT, data: { value: 'package' }},
            { label: 'In this object',  type: ColumnType.URL, data: { value: 'objectRef.url', label: 'objectRef.name' }}, 
            { label: 'Object Type',     type: ColumnType.TXT, data: { value: 'objectRef.typeRef.label' }},
            { label: 'Hardcoded URLs',  type: ColumnType.TXTS, data: { values: 'hardCodedURLs' }},
            { label: 'Hardcoded IDs',   type: ColumnType.TXTS, data: { values: 'hardCodedIDs' }},
            { label: 'Type',            type: ColumnType.TXT, data: { value: 'type' }},
            { label: 'Behavior',        type: ColumnType.TXT, data: { value: 'behavior' }},
            { label: 'Created date',    type: ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date',   type: ColumnType.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Using',           type: ColumnType.NUM, data: { value: 'dependencies.using.length' }},
            { label: 'Referenced in',   type: ColumnType.NUM, data: { value: 'dependencies.referenced.length' }, modifier: { minimum: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }}, 
            { label: 'Ref. in Layout?', type: ColumnType.NUM, data: { value: `dependencies.referencedByTypes.${PAGELAYOUT}` }},
            { label: 'Dependencies',    type: ColumnType.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Description',     type: ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }},
        ],
        orderIndex: 1,
        orderSort: SortOrder.DESC
    }};

    /**
     * @description Table definition for static resources
     * @returns {Table} Static resources table definition
     */
    static get StaticResources() { return {
        columns: [
            { label: '#',               type: ColumnType.IDX },
            { label: 'Score',           type: ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',            type: ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'Package',         type: ColumnType.TXT, data: { value: 'package' }},
            { label: 'Content Type',    type: ColumnType.TXT, data: { value: 'contentType' }},
            { label: 'Created date',    type: ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date',   type: ColumnType.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Using',           type: ColumnType.NUM, data: { value: 'dependencies.using.length' }},
            { label: 'Referenced in',   type: ColumnType.NUM, data: { value: 'dependencies.referenced.length' }, modifier: { minimum: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }}, 
            { label: 'Dependencies',    type: ColumnType.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Description',     type: ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }},
        ],
        orderIndex: 1,
        orderSort: SortOrder.DESC
    }};

    /**
     * @description Table definition for record types (specific to the current selected object)
     * @returns {Table} Record types table definition
     */
    static get RecordTypesInObject() { return {
        columns: [
            { label: '#',              type: ColumnType.IDX },
            { label: 'Score',          type: ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',           type: ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'Developer Name', type: ColumnType.TXT, data: { value: 'developerName' }},
            { label: 'Is Active',      type: ColumnType.CHK, data: { value: 'isActive' }},
            { label: 'Is Available',   type: ColumnType.CHK, data: { value: 'isAvailable' }},
            { label: 'Is Default',     type: ColumnType.CHK, data: { value: 'isDefault' }},
            { label: 'Is Master',      type: ColumnType.CHK, data: { value: 'isMaster' }}
        ],
        orderIndex: 1,
        orderSort: SortOrder.DESC
    }};

    /**
     * @description Table definition for record types for all objects
     * @returns {Table} Record types table definition
     */
    static get RecordTypes() { return {
        columns: [
            { label: '#',              type: ColumnType.IDX },
            { label: 'Score',          type: ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',           type: ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'Developer Name', type: ColumnType.TXT, data: { value: 'developerName' }},
            { label: 'Package',        type: ColumnType.TXT, data: { value: 'package' }},
            { label: 'In this object', type: ColumnType.URL, data: { value: 'objectRef.url', label: 'objectRef.name' }}, 
            { label: 'Object Type',    type: ColumnType.TXT, data: { value: 'objectRef.typeRef.label' }},
            { label: 'Is Active',      type: ColumnType.CHK, data: { value: 'isActive' }},
            { label: 'Is Available',   type: ColumnType.CHK, data: { value: 'isAvailable' }},
            { label: 'Is Default',     type: ColumnType.CHK, data: { value: 'isDefault' }},
            { label: 'Is Master',      type: ColumnType.CHK, data: { value: 'isMaster' }}
        ],
        orderIndex: 1,
        orderSort: SortOrder.DESC
    }};

    /**
     * @description Table definition for sobject relationships (specific to the current selected object)
     * @returns {Table} Relationships table definition
     */
    static get Relationships() { return {
        columns: [
            { label: '#',                    type: ColumnType.IDX },
            { label: 'Name',                 type: ColumnType.TXT, data: { value: 'name' }},
            { label: 'Field Name',           type: ColumnType.TXT, data: { value: 'fieldName' }},
            { label: 'Child Object',         type: ColumnType.TXT, data: { value: 'childObject' }},
            { label: 'Is Cascade Delete',    type: ColumnType.CHK, data: { value: 'isCascadeDelete' }},
            { label: 'Is Restricted Delete', type: ColumnType.CHK, data: { value: 'isRestrictedDelete' }}
        ],
        orderIndex: 1,
        orderSort: SortOrder.ASC
    }};

    /**
     * @description Table definition for chatter groups
     * @returns {Table} Chatter groups table definition
     */
    static get ChatterGroups() { return {
        columns: [
            { label: '#',                   type: ColumnType.IDX },
            { label: 'Score',               type: ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Group',               type: ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'Description',         type: ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }},
            { label: 'Hardcoded URLs',      type: ColumnType.TXTS, data: { values: 'hardCodedURLs' }},
            { label: 'Hardcoded IDs',       type: ColumnType.TXTS, data: { values: 'hardCodedIDs' }}
        ],
        orderIndex: 1,
        orderSort: SortOrder.DESC
    }};

    /**
     * @description Data definition for browsers
     * @returns {Table} Browsers table definition
     */
    static get Browsers() { return {
        columns: [
            { label: '#',                   type: ColumnType.IDX },
            { label: 'Score',               type: ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Full name',           type: ColumnType.TXT, data: { value: 'fullName' }},
            { label: 'Name',                type: ColumnType.TXT, data: { value: 'name' }},
            { label: 'Version',             type: ColumnType.NUM, data: { value: 'version' }},
            { label: '#Application Logins', type: ColumnType.NUM, data: { value: 'nbApplicationLogin' }}
        ],
        orderIndex: 1,
        orderSort: SortOrder.DESC
    }};

    /**
     * @description Table definition for custom fields
     * @returns {Table} Custom fields table definition
     */
    static get CustomFields() { return {
        columns: [
            { label: '#',                   type: ColumnType.IDX },
            { label: 'Score',               type: ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Field',               type: ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'Label',               type: ColumnType.TXT, data: { value: 'label' }},
            { label: 'Object API Name',     type: ColumnType.TXT, data: { value: 'objectId' }}, 
            { label: 'Object Name',         type: ColumnType.URL, data: { value: 'objectRef.url', label: 'objectRef.name' }, modifier: { valueIfEmpty: 'N/A' }}, 
            { label: 'Object Type',         type: ColumnType.TXT, data: { value: 'objectRef.typeRef.label' }, modifier: { valueIfEmpty: 'N/A' }},
            { label: 'Package',             type: ColumnType.TXT, data: { value: 'package' }},
            { label: 'Type',                type: ColumnType.TXT, data: { value: 'type' }},
            { label: 'Length',              type: ColumnType.TXT, data: { value: 'length' }},
            { label: 'Unique?',             type: ColumnType.CHK, data: { value: 'isUnique' }},
            { label: 'Encrypted?',          type: ColumnType.CHK, data: { value: 'isEncrypted' }},
            { label: 'External?',           type: ColumnType.CHK, data: { value: 'isExternalId' }},
            { label: 'Indexed?',            type: ColumnType.CHK, data: { value: 'isIndexed' }},
            { label: 'Restricted?',         type: ColumnType.CHK, data: { value: 'isRestrictedPicklist' }},
            { label: 'Tooltip',             type: ColumnType.TXT, data: { value: 'tooltip' }, modifier: { maximumLength: 45, valueIfEmpty: 'No tooltip.' }},
            { label: 'Formula',             type: ColumnType.TXT, data: { value: 'formula' }, modifier: { maximumLength: 100 , preformatted: true }},
            { label: 'Hardcoded URLs',      type: ColumnType.TXTS, data: { values: 'hardCodedURLs' }},
            { label: 'Hardcoded IDs',       type: ColumnType.TXTS, data: { values: 'hardCodedIDs' }},
            { label: 'Default Value',       type: ColumnType.TXT, data: { value: 'defaultValue' }},
            { label: 'Using',               type: ColumnType.NUM, data: { value: 'dependencies.using.length' }},
            { label: 'Referenced in',       type: ColumnType.NUM, data: { value: 'dependencies.referenced.length' }, modifier: { minimum: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }}, 
            { label: 'Ref. in Layout?',     type: ColumnType.NUM, data: { value: `dependencies.referencedByTypes.${PAGELAYOUT}` }},
            { label: 'Ref. in Apex Class?', type: ColumnType.NUM, data: { value: `dependencies.referencedByTypes.${APEXCLASS}` }},
            { label: 'Ref. in Flow?',       type: ColumnType.NUM, data: { value: `dependencies.referencedByTypes.${FLOWVERSION}` }},
            { label: 'Dependencies',        type: ColumnType.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Created date',        type: ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date',       type: ColumnType.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Description',         type: ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
        ],
        orderIndex: 1,
        orderSort: SortOrder.DESC
    }};

    /**
     * @description Table definition for custom fields (specific to the current selected object)
     * @returns {Table} Custom fields table definition
     */
    static get CustomFieldsInObject() { return {
        columns: [
            { label: '#',                   type: ColumnType.IDX },
            { label: 'Score',               type: ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Field',               type: ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'Label',               type: ColumnType.TXT, data: { value: 'label' }},
            { label: 'Package',             type: ColumnType.TXT, data: { value: 'package' }},
            { label: 'Type',                type: ColumnType.TXT, data: { value: 'type' }},
            { label: 'Length',              type: ColumnType.TXT, data: { value: 'length' }},
            { label: 'Unique?',             type: ColumnType.CHK, data: { value: 'isUnique' }},
            { label: 'Encrypted?',          type: ColumnType.CHK, data: { value: 'isEncrypted' }},
            { label: 'External?',           type: ColumnType.CHK, data: { value: 'isExternalId' }},
            { label: 'Indexed?',            type: ColumnType.CHK, data: { value: 'isIndexed' }},
            { label: 'Restricted?',         type: ColumnType.CHK, data: { value: 'isRestrictedPicklist' }},
            { label: 'Tooltip',             type: ColumnType.TXT, data: { value: 'tooltip' }, modifier: { maximumLength: 45, valueIfEmpty: 'No tooltip.' }},
            { label: 'Formula',             type: ColumnType.TXT, data: { value: 'formula' }, modifier: { maximumLength: 100 , preformatted: true }},
            { label: 'Hardcoded URLs',      type: ColumnType.TXTS, data: { values: 'hardCodedURLs' }},
            { label: 'Hardcoded IDs',       type: ColumnType.TXTS, data: { values: 'hardCodedIDs' }},
            { label: 'Default Value',       type: ColumnType.TXT, data: { value: 'defaultValue' }},
            { label: 'Using',               type: ColumnType.NUM, data: { value: 'dependencies.using.length' }},
            { label: 'Referenced in',       type: ColumnType.NUM, data: { value: 'dependencies.referenced.length' }, modifier: { minimum: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }},
            { label: 'Ref. in Layout?',     type: ColumnType.NUM, data: { value: `dependencies.referencedByTypes.${PAGELAYOUT}` }}, 
            { label: 'Ref. in Apex Class?', type: ColumnType.NUM, data: { value: `dependencies.referencedByTypes.${APEXCLASS}` }}, 
            { label: 'Ref. in Flow?',       type: ColumnType.NUM, data: { value: `dependencies.referencedByTypes.${FLOWVERSION}` }}, 
            { label: 'Dependencies',        type: ColumnType.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Created date',        type: ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date',       type: ColumnType.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Description',         type: ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
        ],
        orderIndex: 1,
        orderSort: SortOrder.DESC
    }};

    /**
     * @description Table definition for standard fields (specific to the current selected object)
     * @returns {Table} Standard fields table definition
     */
    static get StandardFieldsInObject() { return {
        columns: [
            { label: '#',                   type: ColumnType.IDX },
            { label: 'Score',               type: ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }}, 
            { label: 'Field',               type: ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'Label',               type: ColumnType.TXT, data: { value: 'label' }},
            { label: 'Type',                type: ColumnType.TXT, data: { value: 'type' }},
            { label: 'Length',              type: ColumnType.TXT, data: { value: 'length' }},
            { label: 'Unique?',             type: ColumnType.CHK, data: { value: 'isUnique' }},
            { label: 'Encrypted?',          type: ColumnType.CHK, data: { value: 'isEncrypted' }},
            { label: 'External?',           type: ColumnType.CHK, data: { value: 'isExternalId' }},
            { label: 'Indexed?',            type: ColumnType.CHK, data: { value: 'isIndexed' }},
            { label: 'Restricted?',         type: ColumnType.CHK, data: { value: 'isRestrictedPicklist' }},
            { label: 'Tooltip',             type: ColumnType.TXT, data: { value: 'tooltip' }, modifier: { maximumLength: 45, valueIfEmpty: 'No tooltip.' }},
            { label: 'Formula',             type: ColumnType.TXT, data: { value: 'formula' }, modifier: { maximumLength: 100 , preformatted: true }},
            { label: 'Default Value',       type: ColumnType.TXT, data: { value: 'defaultValue' }},
            { label: 'Created date',        type: ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date',       type: ColumnType.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Description',         type: ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
        ],
        orderIndex: 1,
        orderSort: SortOrder.DESC
    }};

    /**
     * @description Table definition for custom labels
     * @returns {Table} Custom labels table definition
     */
    static get CustomLabels() { return {
        columns: [
            { label: '#',                   type: ColumnType.IDX },
            { label: 'Score',               type: ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',                type: ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'Package',             type: ColumnType.TXT, data: { value: 'package' }},
            { label: 'Label',               type: ColumnType.TXT, data: { value: 'label' }},
            { label: 'Category',            type: ColumnType.TXT, data: { value: 'category' }},
            { label: 'Language',            type: ColumnType.TXT, data: { value: 'language' }},
            { label: 'Protected?',          type: ColumnType.CHK, data: { value: 'isProtected' }},
            { label: 'Using',               type: ColumnType.NUM, data: { value: 'dependencies.using.length' }},
            { label: 'Referenced in',       type: ColumnType.NUM, data: { value: 'dependencies.referenced.length' }, modifier: { minimum: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }},
            { label: 'Ref. in Layout?',     type: ColumnType.NUM, data: { value: `dependencies.referencedByTypes.${PAGELAYOUT}`}},
            { label: 'Ref. in Apex Class?', type: ColumnType.NUM, data: { value: `dependencies.referencedByTypes.${APEXCLASS}`}},
            { label: 'Ref. in Flow?',       type: ColumnType.NUM, data: { value: `dependencies.referencedByTypes.${FLOWVERSION}`}},
            { label: 'Dependencies',        type: ColumnType.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Created date',        type: ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date',       type: ColumnType.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Value',               type: ColumnType.TXT, data: { value: 'value'}, modifier: { maximumLength: 45, preformatted: true }}
        ],
        orderIndex: 1,
        orderSort: SortOrder.DESC
    }};

    /**
     * @description Table definition for custom tabs
     * @returns {Table} Custom tabs table definition
     */
    static get CustomTabs() { return {
        columns: [
            { label: '#',               type: ColumnType.IDX },
            { label: 'Score',           type: ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',            type: ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'Package',         type: ColumnType.TXT, data: { value: 'package' }},
            { label: 'Type',            type: ColumnType.TXT, data: { value: 'type' }},
            { label: 'Hardcoded URLs',  type: ColumnType.TXTS, data: { values: 'hardCodedURLs' }},
            { label: 'Hardcoded IDs',   type: ColumnType.TXTS, data: { values: 'hardCodedIDs' }},
            { label: 'Created date',    type: ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date',   type: ColumnType.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Using',           type: ColumnType.NUM, data: { value: 'dependencies.using.length' }},
            { label: 'Referenced in',   type: ColumnType.NUM, data: { value: 'dependencies.referenced.length' }, modifier: { minimum: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }}, 
            { label: 'Dependencies',    type: ColumnType.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Description',     type: ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
        ],
        orderIndex: 1,
        orderSort: SortOrder.DESC
    }};

    /**
     * @description Table definition for documents
     * @returns {Table} Documents table definition
     */
    static get Documents() { return {
        columns: [
            { label: '#',                   type: ColumnType.IDX },
            { label: 'Score',               type: ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',                type: ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'Package',             type: ColumnType.TXT, data: { value: 'package' }},
            { label: 'Folder',              type: ColumnType.TXT, data: { value: 'folderName' }},
            { label: 'Document URL',        type: ColumnType.TXT, data: { value: 'documentUrl' }},
            { label: 'Size (bytes)',        type: ColumnType.NUM, data: { value: 'size' }},
            { label: 'Type',                type: ColumnType.TXT, data: { value: 'type' }},
            { label: 'Created date',        type: ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date',       type: ColumnType.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Description',         type: ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
        ],
        orderIndex: 1,
        orderSort: SortOrder.DESC
    }};

    /**
     * @description Table definition for dashboards
     * @returns {Table} Dashboards table definition
     */
    static get Dashboards() { return {
        columns: [
            { label: '#',               type: ColumnType.IDX },
            { label: 'Score',           type: ColumnType.SCR, data: { value: 'score', id: 'id', name: 'title' }},
            { label: 'Title',           type: ColumnType.URL, data: { value: 'url', label: 'title' }},
            { label: 'Developer Name',  type: ColumnType.TXT, data: { value: 'developerName' }},
            { label: 'Package',         type: ColumnType.TXT, data: { value: 'package' }},
            { label: 'Type',            type: ColumnType.TXT, data: { value: 'type' }},
            { label: 'Last viewed',     type: ColumnType.DTM, data: { value: 'lastViewedDate' }},
            { label: 'Last referenced', type: ColumnType.DTM, data: { value: 'lastReferencedDate' }},
            { label: 'Refreshed',       type: ColumnType.DTM, data: { value: 'resultRefreshedDate' }},
            { label: 'Created date',    type: ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date',   type: ColumnType.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Description',     type: ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }},
            { label: 'Folder',          type: ColumnType.TXT, data: { value: 'folderName' }},
        ],
        orderIndex: 1,
        orderSort: SortOrder.DESC
    }};

    /**
     * @description Table definition for reports
     * @returns {Table} Reports table definition
     */
    static get Reports() { return {
        columns: [
            { label: '#',               type: ColumnType.IDX },
            { label: 'Score',           type: ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',            type: ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'Developer Name',  type: ColumnType.TXT, data: { value: 'developerName' }},
            { label: 'Package',         type: ColumnType.TXT, data: { value: 'package' }},
            { label: 'Format',          type: ColumnType.TXT, data: { value: 'format' }},
            { label: 'Last run',        type: ColumnType.DTM, data: { value: 'lastRunDate' }},
            { label: 'Last viewed',     type: ColumnType.DTM, data: { value: 'lastViewedDate' }},
            { label: 'Last referenced', type: ColumnType.DTM, data: { value: 'lastReferencedDate' }},
            { label: 'Created date',    type: ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date',   type: ColumnType.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Description',     type: ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }},
            { label: 'Folder',          type: ColumnType.TXT, data: { value: 'folderName' }}
        ],
        orderIndex: 1,
        orderSort: SortOrder.DESC
    }};

    /**
     * @description Table definition for lightning aura components
     * @returns {Table} Aura components table definition
     */
    static get AuraComponents() { return {
        columns: [
            { label: '#',             type: ColumnType.IDX },
            { label: 'Score',         type: ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',          type: ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'API Version',   type: ColumnType.NUM, data: { value: 'apiVersion' }, modifier: { valueIfEmpty: 'No version.' }},
            { label: 'Package',       type: ColumnType.TXT, data: { value: 'package' }},
            { label: 'Using',         type: ColumnType.NUM, data: { value: 'dependencies.using.length' }},
            { label: 'Referenced in', type: ColumnType.NUM, data: { value: 'dependencies.referenced.length' }, modifier: { minimum: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }},
            { label: 'Dependencies',  type: ColumnType.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Created date',  type: ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date', type: ColumnType.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Description',   type: ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
        ],
        orderIndex: 1,
        orderSort: SortOrder.DESC
    }};

    /**
     * @description Table definition for lightning pages
     * @returns {Table} Lightning pages table definition
     */
    static get FlexiPages() { return {
        columns: [
            { label: '#',                  type: ColumnType.IDX },
            { label: 'Score',              type: ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',               type: ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'Type',               type: ColumnType.TXT, data: { value: 'type' }},
            { label: 'Package',            type: ColumnType.TXT, data: { value: 'package' }},
            { label: 'Object',             type: ColumnType.URL, data: { value: 'objectRef.url', label: 'objectRef.name' }, modifier: { valueIfEmpty: 'Not related to an object.' }},
            { label: '#Components',        type: ColumnType.NUM, data: { value: 'nbComponents' }},
            { label: '#Fields',            type: ColumnType.NUM, data: { value: 'nbFields' }},
            { label: '#Related Lists',     type: ColumnType.NUM, data: { value: 'nbRelatedLists' }},
            { label: 'Attachment List?',   type: ColumnType.CHK, data: { value: 'isAttachmentRelatedListIncluded' }},
            { label: 'Lists from Layout?', type: ColumnType.CHK, data: { value: 'isRelatedListFromPageLayoutIncluded' }},
            { label: 'Using',              type: ColumnType.NUM, data: { value: 'dependencies.using.length' }},
            { label: 'Referenced in',      type: ColumnType.NUM, data: { value: 'dependencies.referenced.length' }, modifier: { minimum: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }},
            { label: 'Dependencies',       type: ColumnType.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Created date',       type: ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date',      type: ColumnType.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Description',        type: ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
        ],
        orderIndex: 1,
        orderSort: SortOrder.DESC
    }};

    /**
     * @description Table definition for lightning pages within an SObject
     * @returns {Table} Lightning pages table definition
     */
    static get FlexiPagesInObject() { return {
        columns: [
            { label: '#',                  type: ColumnType.IDX },
            { label: 'Score',              type: ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',               type: ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'Type',               type: ColumnType.TXT, data: { value: 'type' }},
            { label: 'Package',            type: ColumnType.TXT, data: { value: 'package' }},
            { label: '#Components',        type: ColumnType.NUM, data: { value: 'nbComponents' }},
            { label: '#Fields',            type: ColumnType.NUM, data: { value: 'nbFields' }},
            { label: '#Related Lists',     type: ColumnType.NUM, data: { value: 'nbRelatedLists' }},
            { label: 'Attachment List?',   type: ColumnType.CHK, data: { value: 'isAttachmentRelatedListIncluded' }},
            { label: 'Lists from Layout?', type: ColumnType.CHK, data: { value: 'isRelatedListFromPageLayoutIncluded' }},
            { label: 'Using',              type: ColumnType.NUM, data: { value: 'dependencies.using.length' }},
            { label: 'Referenced in',      type: ColumnType.NUM, data: { value: 'dependencies.referenced.length' }, modifier: { minimum: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }},
            { label: 'Dependencies',       type: ColumnType.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Created date',       type: ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date',      type: ColumnType.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Description',        type: ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
        ],
        orderIndex: 1,
        orderSort: SortOrder.DESC
    }};

    /**
     * @description Table definition for knowledge articles
     * @returns {Table} Knowledge articles table definition
     */ 
    static get KnowledgeArticles() { return {
        columns: [
            { label: '#',              type: ColumnType.IDX },
            { label: 'Score',          type: ColumnType.SCR, data: { value: 'score', id: 'versionId', name: 'number' }},
            { label: 'Name',           type: ColumnType.URL, data: { value: 'url', label: 'number' }},
            { label: 'Title',          type: ColumnType.TXT, data: { value: 'title' }},
            { label: 'Status',         type: ColumnType.TXT, data: { value: 'status' }},
            { label: 'Url Name',       type: ColumnType.TXT, data: { value: 'urlName' }},
            { label: 'Hardcoded URL?', type: ColumnType.CHK, data: { value: 'isHardCodedURL' }},
            { label: 'Created date',   type: ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date',  type: ColumnType.DTM, data: { value: 'lastModifiedDate' }},
        ],
        orderIndex: 1,
        orderSort: SortOrder.DESC
    }};

    /**
     * @description Table definition for lightning web components
     * @returns {Table} Lightning web components table definition
     */
    static get LightningWebComponents() { return {
        columns: [
            { label: '#',             type: ColumnType.IDX },
            { label: 'Score',         type: ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',          type: ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'API Version',   type: ColumnType.NUM, data: { value: 'apiVersion' }, modifier: { valueIfEmpty: 'No version.' }}, 
            { label: 'Package',       type: ColumnType.TXT, data: { value: 'package' }},
            { label: 'Using',         type: ColumnType.NUM, data: { value: 'dependencies.using.length' }},
            { label: 'Referenced in', type: ColumnType.NUM, data: { value: 'dependencies.referenced.length' }, modifier: { minimum: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }},
            { label: 'Dependencies',  type: ColumnType.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Created date',  type: ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date', type: ColumnType.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Description',   type: ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
        ],
        orderIndex: 1,
        orderSort: SortOrder.DESC
    }};

    /**
     * @description Table definition for page layouts
     * @returns {Table} Page layouts table definition
     */
    static get PageLayouts() { return {
        columns: [
            { label: '#',                type: ColumnType.IDX },
            { label: 'Score',            type: ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',             type: ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'Package',          type: ColumnType.TXT, data: { value: 'package' }},
            { label: 'Type',             type: ColumnType.TXT, data: { value: 'type' }},
            { label: 'Object',           type: ColumnType.URL, data: { value: 'objectRef.url', label: 'objectRef.name' }, modifier: { valueIfEmpty: 'Not related to an object.' }},
            { label: 'Assignment Count', type: ColumnType.NUM, data: { value: 'profileAssignmentCount' }},
            { label: '#Fields',          type: ColumnType.NUM, data: { value: 'nbFields' }},
            { label: '#Related Lists',   type: ColumnType.NUM, data: { value: 'nbRelatedLists' }},
            { label: 'Attachment List?', type: ColumnType.CHK, data: { value: 'isAttachmentRelatedListIncluded' }},
            { label: 'Created date',     type: ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date',    type: ColumnType.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Using',            type: ColumnType.NUM, data: { value: 'dependencies.using.length' }},
            { label: 'Referenced in',    type: ColumnType.NUM, data: { value: 'dependencies.referenced.length' }, modifier: { minimum: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }}, 
            { label: 'Dependencies',     type: ColumnType.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }}
        ],
        orderIndex: 1,
        orderSort: SortOrder.DESC
    }};

    /**
     * @description Table definition for permission sets
     * @returns {Table} Permission sets table definition
     */
    static get PermissionSets() { return {
        columns: [
            { label: '#',                      type: ColumnType.IDX },
            { label: 'Score',                  type: ColumnType.SCR,  data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',                   type: ColumnType.URL,  data: { value: 'url', label: 'name' }},
            { label: 'Is Group?',              type: ColumnType.CHK,  data: { value: 'isGroup' }},
            { label: 'Custom',                 type: ColumnType.CHK,  data: { value: 'isCustom' }},
            { label: '#FLSs',                  type: ColumnType.NUM,  data: { value: 'nbFieldPermissions' }},
            { label: '#Object CRUDs',          type: ColumnType.NUM,  data: { value: 'nbObjectPermissions' }},
            { label: 'Is Admin-like?',         type: ColumnType.CHK,  data: { value: 'isAdminLike' }},
            { label: 'Api Enabled',            type: ColumnType.CHK,  data: { value: 'importantPermissions.apiEnabled' }},
            { label: 'View Setup',             type: ColumnType.CHK,  data: { value: 'importantPermissions.viewSetup' }},
            { label: 'Modify All Data',        type: ColumnType.CHK,  data: { value: 'importantPermissions.modifyAllData' }},
            { label: 'View All Data',          type: ColumnType.CHK,  data: { value: 'importantPermissions.viewAllData' }},
            { label: 'Manage Users',           type: ColumnType.CHK,  data: { value: 'importantPermissions.manageUsers' }},
            { label: 'Customize Application',  type: ColumnType.CHK,  data: { value: 'importantPermissions.customizeApplication' }},
            { label: 'License',                type: ColumnType.TXT,  data: { value: 'license' }},
            { label: 'Package',                type: ColumnType.TXT,  data: { value: 'package' }},
            { label: '#Active users',          type: ColumnType.NUM,  data: { value: 'memberCounts' }, modifier: { minimum: 1, valueBeforeMin: 'No active user', valueIfEmpty: '' }},
            { label: 'Contains',               type: ColumnType.URLS, data: { values: 'permissionSetRefs', value: 'url', label: 'name' }},
            { label: 'Included in',            type: ColumnType.URLS, data: { values: 'permissionSetGroupRefs', value: 'url', label: 'name' }},
            { label: 'All groups are empty?',  type: ColumnType.CHK,  data: { value: 'allIncludingGroupsAreEmpty' }},
            { label: 'Created date',           type: ColumnType.DTM,  data: { value: 'createdDate' }},
            { label: 'Modified date',          type: ColumnType.DTM,  data: { value: 'lastModifiedDate' }},
            { label: 'Description',            type: ColumnType.TXT,  data: { value: 'description'}, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
        ],
        orderIndex: 1,
        orderSort: SortOrder.DESC
    }};

    /**
     * @description Table definition for permission set licenses
     * @returns {Table} Permission set licenses table definition
     */
    static get PermissionSetLicenses() { return {
        columns: [
            { label: '#',                     type: ColumnType.IDX },
            { label: 'Score',                 type: ColumnType.SCR,  data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',                  type: ColumnType.URL,  data: { value: 'url', label: 'name' }},
            { label: 'Total',                 type: ColumnType.NUM,  data: { value: 'totalCount' }},
            { label: 'Used',                  type: ColumnType.NUM,  data: { value: 'usedCount' }},
            { label: 'Used (%)',              type: ColumnType.PRC,  data: { value: 'usedPercentage' }},
            { label: 'Remaining',             type: ColumnType.NUM,  data: { value: 'remainingCount' }},
            { label: 'Users Really Assigned', type: ColumnType.NUM,  data: { value: 'distinctActiveAssigneeCount' }},
            { label: 'Permission Sets',       type: ColumnType.URLS, data: { values: 'permissionSetRefs', value: 'url', label: 'name' }},
            { label: 'Status',                type: ColumnType.TXT,  data: { value: 'status' }},
            { label: 'Expiration Date',       type: ColumnType.DTM,  data: { value: 'expirationDate' }},
            { label: 'For Integration?',      type: ColumnType.CHK,  data: { value: 'isAvailableForIntegrations' }},
            { label: 'Created date',          type: ColumnType.DTM,  data: { value: 'createdDate' }},
            { label: 'Modified date',         type: ColumnType.DTM,  data: { value: 'lastModifiedDate' }},
        ],
        orderIndex: 1,
        orderSort: SortOrder.DESC
    }};

    /**
     * @description Table definition for profiles
     * @returns {Table} Profiles table definition
     */
    static get Profiles() { return {
        columns: [
            { label: '#',                      type: ColumnType.IDX },
            { label: 'Score',                  type: ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',                   type: ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'Custom',                 type: ColumnType.CHK, data: { value: 'isCustom' }},
            { label: '#FLSs',                  type: ColumnType.NUM, data: { value: 'nbFieldPermissions' }},
            { label: '#Object CRUDs',          type: ColumnType.NUM, data: { value: 'nbObjectPermissions' }},
            { label: 'Is Admin-like?',         type: ColumnType.CHK, data: { value: 'isAdminLike' }},
            { label: 'Api Enabled',            type: ColumnType.CHK, data: { value: 'importantPermissions.apiEnabled' }},
            { label: 'View Setup',             type: ColumnType.CHK, data: { value: 'importantPermissions.viewSetup' }},
            { label: 'Modify All Data',        type: ColumnType.CHK, data: { value: 'importantPermissions.modifyAllData' }},
            { label: 'View All Data',          type: ColumnType.CHK, data: { value: 'importantPermissions.viewAllData' }},
            { label: 'Manage Users',           type: ColumnType.CHK, data: { value: 'importantPermissions.manageUsers' }},
            { label: 'Customize Application',  type: ColumnType.CHK, data: { value: 'importantPermissions.customizeApplication' }},
            { label: 'License',                type: ColumnType.TXT, data: { value: 'license' }},
            { label: 'Package',                type: ColumnType.TXT, data: { value: 'package' }},
            { label: '#Active users',          type: ColumnType.NUM, data: { value: 'memberCounts' }, modifier: { minimum: 1, valueBeforeMin: 'No active user!', valueIfEmpty: '' }},
            { label: 'Created date',           type: ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date',          type: ColumnType.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Description',            type: ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
        ],
        orderIndex: 1,
        orderSort: SortOrder.DESC
    }};

    /**
     * @description Table definition for profile restrictions
     * @returns {Table} Profile restrictions table definition
     */
    static get ProfileRestrictions() { return {
        columns: [
            { label: '#',               type: ColumnType.IDX },
            { label: 'Score',           type: ColumnType.SCR,  data: { value: 'score', id: 'profileRef.id', name: 'profileRef.name' }},
            { label: 'Name',            type: ColumnType.URL,  data: { value: 'profileRef.url', label: 'profileRef.name' }},
            { label: 'Custom',          type: ColumnType.CHK,  data: { value: 'profileRef.isCustom' }},
            { label: 'Package',         type: ColumnType.TXT,  data: { value: 'profileRef.package' }},
            { label: 'Ip Ranges',       type: ColumnType.OBJS, data: { values: 'ipRanges', template: (r) => `${r.description}: from ${r.startAddress} to ${r.endAddress} --> ${r.difference*1} address(es)` }},
            { label: 'Login Hours',     type: ColumnType.OBJS, data: { values: 'loginHours', template: (r) => `${r.day} from ${r.fromTime} to ${r.toTime} --> ${r.difference*1} minute(s)` }},
            { label: 'Description',     type: ColumnType.TXT,  data: { value: 'profileRef.description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
        ],
        orderIndex: 1,
        orderSort: SortOrder.DESC
    }};

    /**
     * @description Table definition for profiles password policies
     * @returns {Table} Profile password policies table definition
     */
    static get ProfilePasswordPolicies() { return {
        columns: [
            { label: '#',                                         type: ColumnType.IDX },
            { label: 'Score',                                     type: ColumnType.SCR, data: { value: 'score', id: 'profileName', name: 'profileName' }},
            { label: 'Name',                                      type: ColumnType.TXT, data: { value: 'profileName' }},
            { label: 'User password expires in',                  type: ColumnType.NUM, data: { value: 'passwordExpiration' }},
            { label: 'Enforce password history',                  type: ColumnType.NUM, data: { value: 'passwordHistory' }},
            { label: 'Minimum password length',                   type: ColumnType.NUM, data: { value: 'minimumPasswordLength' }},
            { label: 'Level of complexity (/5)',                  type: ColumnType.NUM, data: { value: 'passwordComplexity' }},
            { label: 'Question can contain password',             type: ColumnType.CHK, data: { value: 'passwordQuestion' }},
            { label: 'Maximum Login Attempts',                    type: ColumnType.NUM, data: { value: 'maxLoginAttempts' }},
            { label: 'Lockout period',                            type: ColumnType.NUM, data: { value: 'lockoutInterval' }},
            { label: 'Require minimum one day password lifetime', type: ColumnType.CHK, data: { value: 'minimumPasswordLifetime' }},
            { label: 'Security Question Hidden',                  type: ColumnType.CHK, data: { value: 'obscure' }},
        ],
        orderIndex: 1,
        orderSort: SortOrder.DESC
    }};

    /**
     * @description Table definition for public groups
     * @returns {Table} Public groups table definition
     */
    static get PublicGroups() { return {
        columns: [
            { label: '#',                       type: ColumnType.IDX },
            { label: 'Score',                   type: ColumnType.SCR,  data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',                    type: ColumnType.URL,  data: { value: 'url', label: 'name' }},
            { label: 'Developer Name',          type: ColumnType.TXT,  data: { value: 'developerName' }},
            { label: 'With bosses?',            type: ColumnType.CHK,  data: { value: 'includeBosses' }},
            { label: '#Explicit members',       type: ColumnType.NUM,  data: { value: 'nbDirectMembers' }},
            { label: 'Explicit groups (links)', type: ColumnType.URLS, data: { values: 'directGroupRefs', value: 'url', label: 'name' }},
            { label: 'Explicit groups (info)',  type: ColumnType.OBJS, data: { values: 'directGroupRefs', template: (g) => `${g.name} (${g.type}${g.includeBosses?' with bosses':''}${g.includeSubordinates?' with subordinates':''})` }},
            { label: 'Explicit users',          type: ColumnType.URLS, data: { values: 'directUserRefs', value: 'url', label: 'name' }}
        ],
        orderIndex: 1,
        orderSort: SortOrder.DESC
    }};

    /**
     * @description Table definition for queues
     * @returns {Table} Queues table definition
     */
    static get Queues() { return TableDefinitions.PublicGroups; }

    /**
     * @description Table definition for active internal users
     * @returns {Table} Active internal users table definition
     */
    static get Users() { return {
        columns: [
            { label: '#',                      type: ColumnType.IDX },
            { label: 'Score',                  type: ColumnType.SCR,  data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'User Name',              type: ColumnType.URL,  data: { value: 'url', label: 'name' }},
            { label: 'Under LEX?',             type: ColumnType.CHK,  data: { value: 'onLightningExperience' }},
            { label: 'Last login',             type: ColumnType.DTM,  data: { value: 'lastLogin' }, modifier: { valueIfEmpty: 'Never logged!' }},
            { label: 'Failed logins',          type: ColumnType.NUM,  data: { value: 'numberFailedLogins' }},
            { label: 'Has MFA by-pass?',       type: ColumnType.CHK,  data: { value: 'hasMfaByPass' }},
            { label: 'Has Debug mode?',        type: ColumnType.CHK,  data: { value: 'hasDebugMode' }},
            { label: '#SF Logins w/o MFA',     type: ColumnType.NUM,  data: { value: 'nbDirectLoginWithoutMFA' }},
            { label: '#SF Logins w/ MFA',      type: ColumnType.NUM,  data: { value: 'nbDirectLoginWithMFA' }},
            { label: '#SSO Logins',            type: ColumnType.NUM,  data: { value: 'nbSSOLogin' }},
            { label: 'Password change',        type: ColumnType.DTM,  data: { value: 'lastPasswordChange' }},
            { label: 'Is Admin-like?',         type: ColumnType.CHK,  data: { value: 'isAdminLike' }},
            { label: 'Api Enabled',            type: ColumnType.CHK,  data: { value: 'aggregateImportantPermissions.apiEnabled' }},
            { label: 'Api Enabled from',       type: ColumnType.URLS, data: { values: 'aggregateImportantPermissions.apiEnabled', value: 'url', label: 'name' }},
            { label: 'View Setup',             type: ColumnType.CHK,  data: { value: 'aggregateImportantPermissions.viewSetup' }},
            { label: 'View Setup from',        type: ColumnType.URLS, data: { values: 'aggregateImportantPermissions.viewSetup', value: 'url', label: 'name' }},
            { label: 'Modify All Data',        type: ColumnType.CHK,  data: { value: 'aggregateImportantPermissions.modifyAllData' }},
            { label: 'Modify All Data from',   type: ColumnType.URLS, data: { values: 'aggregateImportantPermissions.modifyAllData', value: 'url', label: 'name' }},
            { label: 'View All Data',          type: ColumnType.CHK,  data: { value: 'aggregateImportantPermissions.viewAllData' }},
            { label: 'View All Data from',     type: ColumnType.URLS, data: { values: 'aggregateImportantPermissions.viewAllData', value: 'url', label: 'name' }},
            { label: 'Manage Users',           type: ColumnType.CHK,  data: { value: 'aggregateImportantPermissions.manageUsers' }},
            { label: 'Manage Users from',      type: ColumnType.URLS, data: { values: 'aggregateImportantPermissions.manageUsers', value: 'url', label: 'name' }},
            { label: 'Customize App.',         type: ColumnType.CHK,  data: { value: 'aggregateImportantPermissions.customizeApplication' }},
            { label: 'Customize App. from',    type: ColumnType.URLS, data: { values: 'aggregateImportantPermissions.customizeApplication', value: 'url', label: 'name' }},
            { label: 'Profile',                type: ColumnType.URL,  data: { value: 'profileRef.url', label: 'profileRef.name' }},
            { label: 'Permission Sets',        type: ColumnType.URLS, data: { values: 'permissionSetRefs', value: 'url', label: 'name' }}
        ],
        orderIndex: 1,
        orderSort: SortOrder.DESC
    }};

    /**
     * @description Table definition for visualforce components
     * @returns {Table} Visualforce components table definition
     */
    static get VisualForceComponents() { return {
        columns: [
            { label: '#',              type: ColumnType.IDX },
            { label: 'Score',          type: ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',           type: ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'API Version',    type: ColumnType.NUM, data: { value: 'apiVersion' }, modifier: { valueIfEmpty: 'No version.' }},
            { label: 'Package',        type: ColumnType.TXT, data: { value: 'package' }},
            { label: 'Hardcoded URLs', type: ColumnType.TXTS, data: { values: 'hardCodedURLs' }},
            { label: 'Hardcoded IDs',  type: ColumnType.TXTS, data: { values: 'hardCodedIDs' }},
            { label: 'Using',          type: ColumnType.NUM, data: { value: 'dependencies.using.length' }},
            { label: 'Referenced in',  type: ColumnType.NUM, data: { value: 'dependencies.referenced.length' }, modifier: { minimum: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }},
            { label: 'Dependencies',   type: ColumnType.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Created date',   type: ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date',  type: ColumnType.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Description',    type: ColumnType.TXT, data: { value: 'description'}, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
        ],
        orderIndex: 1,
        orderSort: SortOrder.DESC
    }};

    /**
     * @description Table definition for visualforce pages
     * @returns {Table} Visualforce pages table definition
     */
    static get VisualForcePages() { return {
        columns: [
            { label: '#',              type: ColumnType.IDX },
            { label: 'Score',          type: ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',           type: ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'API Version',    type: ColumnType.NUM, data: { value: 'apiVersion' }, modifier: { valueIfEmpty: 'No version.' }},
            { label: 'Mobile',         type: ColumnType.CHK, data: { value: 'isMobileReady' }},
            { label: 'Package',        type: ColumnType.TXT, data: { value: 'package' }},
            { label: 'Hardcoded URLs', type: ColumnType.TXTS, data: { values: 'hardCodedURLs' }},
            { label: 'Hardcoded IDs',  type: ColumnType.TXTS, data: { values: 'hardCodedIDs' }},
            { label: 'Using',          type: ColumnType.NUM, data: { value: 'dependencies.using.length' }},
            { label: 'Referenced in',  type: ColumnType.NUM, data: { value: 'dependencies.referenced.length' }, modifier: { minimum: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }},
            { label: 'Dependencies',   type: ColumnType.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Created date',   type: ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date',  type: ColumnType.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Description',    type: ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
        ],
        orderIndex: 1,
        orderSort: SortOrder.DESC
    }};

    /**
     * @description Table definition for apex classes (compiled and not tests)
     * @returns {Table} Apex classes table definition
     */
    static get ApexClasses() { return {
        columns: [
            { label: '#',                      type: ColumnType.IDX },
            { label: 'Score',                  type: ColumnType.SCR,  data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',                   type: ColumnType.URL,  data: { value: 'url', label: 'name' }},
            { label: 'API Version',            type: ColumnType.NUM,  data: { value: 'apiVersion' }, modifier: { valueIfEmpty: 'No version.' }},
            { label: 'Package',                type: ColumnType.TXT,  data: { value: 'package' }},
            { label: 'Class',                  type: ColumnType.CHK,  data: { value: 'isClass' }},
            { label: 'Abst.',                  type: ColumnType.CHK,  data: { value: 'isAbstract' }},
            { label: 'Intf.',                  type: ColumnType.CHK,  data: { value: 'isInterface' }},
            { label: 'Enum',                   type: ColumnType.CHK,  data: { value: 'isEnum' }},
            { label: 'Schdl.',                 type: ColumnType.CHK,  data: { value: 'isSchedulable' }},
            { label: 'Access',                 type: ColumnType.TXT,  data: { value: 'specifiedAccess' }},
            { label: 'Implements',             type: ColumnType.TXTS, data: { values: 'interfaces' }},
            { label: 'Extends',                type: ColumnType.TXT,  data: { value: 'extends' }},
            { label: 'Size',                   type: ColumnType.NUM,  data: { value: 'length' }},
            { label: 'Hardcoded URLs',         type: ColumnType.TXTS, data: { values: 'hardCodedURLs' }},
            { label: 'Hardcoded IDs',          type: ColumnType.TXTS, data: { values: 'hardCodedIDs' }},
            { label: 'Methods',                type: ColumnType.NUM,  data: { value: 'methodsCount' }},
            { label: 'Inner Classes',          type: ColumnType.NUM,  data: { value: 'innerClassesCount' }},
            { label: 'Annotations',            type: ColumnType.TXTS, data: { values: 'annotations' }},
            { label: 'Sharing',                type: ColumnType.TXT,  data: { value: 'specifiedSharing' }, modifier: { valueIfEmpty: 'Not specified.' }},
            { label: 'Scheduled',              type: ColumnType.CHK,  data: { value: 'isScheduled' }},
            { label: 'Coverage (>75%)',        type: ColumnType.PRC,  data: { value: 'coverage' }, modifier: { valueIfEmpty: 'No coverage!' }},
            { label: 'Editable Related Tests', type: ColumnType.URLS, data: { values: 'relatedTestClassRefs', value: 'url', label: 'name' }},
            { label: 'Using',                  type: ColumnType.NUM,  data: { value: 'dependencies.using.length' }},
            { label: 'Referenced in',          type: ColumnType.NUM,  data: { value: 'dependencies.referenced.length' }, modifier: { minimum: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }},
            { label: 'Dependencies',           type: ColumnType.DEP,  data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Created date',           type: ColumnType.DTM,  data: { value: 'createdDate' }},
            { label: 'Modified date',          type: ColumnType.DTM,  data: { value: 'lastModifiedDate' }}
        ],
        orderIndex: 1,
        orderSort: SortOrder.DESC
    }};

    /**
     * @description Table definition for uncompiled apex classes
     * @returns {Table} Uncompiled apex classes table definition
     */    
    static get ApexUncompiledClasses() { return {
        columns: [
            { label: '#',                      type: ColumnType.IDX },
            { label: 'Score',                  type: ColumnType.SCR,  data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',                   type: ColumnType.URL,  data: { value: 'url', label: 'name' }},
            { label: 'API Version',            type: ColumnType.NUM,  data: { value: 'apiVersion' }, modifier: { valueIfEmpty: 'No version.' }},
            { label: 'Package',                type: ColumnType.TXT,  data: { value: 'package' }},
            { label: 'Size',                   type: ColumnType.NUM,  data: { value: 'length' }},
            { label: 'Coverage (>75%)',        type: ColumnType.PRC,  data: { value: 'coverage' }, modifier: { valueIfEmpty: 'No coverage!' }},
            { label: 'Editable Related Tests', type: ColumnType.URLS, data: { values: 'relatedTestClassRefs', value: 'url', label: 'name' }},
            { label: 'Using',                  type: ColumnType.NUM,  data: { value: 'dependencies.using.length' }},
            { label: 'Referenced in',          type: ColumnType.NUM,  data: { value: 'dependencies.referenced.length' }, modifier: { minimum: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }},
            { label: 'Dependencies',           type: ColumnType.DEP,  data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Created date',           type: ColumnType.DTM,  data: { value: 'createdDate' }},
            { label: 'Modified date',          type: ColumnType.DTM,  data: { value: 'lastModifiedDate' }}
        ],
        orderIndex: 1,
        orderSort: SortOrder.DESC
    }};

    /**
     * @description Table definition for apex triggers
     * @returns {Table} Apex triggers table definition
     */
    static get ApexTriggers() { return {
        columns: [
            { label: '#',               type: ColumnType.IDX },
            { label: 'Score',           type: ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',            type: ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'API Version',     type: ColumnType.NUM, data: { value: 'apiVersion' }, modifier: { valueIfEmpty: 'No version.' }},
            { label: 'Package',         type: ColumnType.TXT, data: { value: 'package' }},
            { label: 'Size',            type: ColumnType.NUM, data: { value: 'length' }},
            { label: 'Hardcoded URLs',  type: ColumnType.TXTS, data: { values: 'hardCodedURLs' }},
            { label: 'Hardcoded IDs',   type: ColumnType.TXTS, data: { values: 'hardCodedIDs' }},
            { label: 'Object API Name', type: ColumnType.TXT, data: { value: 'objectId' }}, 
            { label: 'Object Name',     type: ColumnType.URL, data: { value: 'objectRef.url', label: 'objectRef.name' }, modifier: { valueIfEmpty: 'N/A' }}, 
            { label: 'Active?',         type: ColumnType.CHK, data: { value: 'isActive' }},
            { label: 'Has SOQL?',       type: ColumnType.CHK, data: { value: 'hasSOQL' }},
            { label: 'Has DML?',        type: ColumnType.CHK, data: { value: 'hasDML' }},
            { label: '*Insert',         type: ColumnType.CHK, data: { value: 'beforeInsert' }},
            { label: 'Insert*',         type: ColumnType.CHK, data: { value: 'afterInsert' }},
            { label: '*Update',         type: ColumnType.CHK, data: { value: 'beforeUpdate' }},
            { label: 'Update*',         type: ColumnType.CHK, data: { value: 'afterUpdate' }},
            { label: '*Delete',         type: ColumnType.CHK, data: { value: 'beforeDelete' }},
            { label: 'Delete*',         type: ColumnType.CHK, data: { value: 'afterDelete' }},
            { label: 'Undelete',        type: ColumnType.CHK, data: { value: 'afterUndelete' }},
            { label: 'Using',           type: ColumnType.NUM, data: { value: 'dependencies.using.length' }},
            { label: 'Dependencies',    type: ColumnType.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Created date',    type: ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date',   type: ColumnType.DTM, data: { value: 'lastModifiedDate' }},
        ],
        orderIndex: 1,
        orderSort: SortOrder.DESC
    }};

    /**
     * @description Table definition for apex triggers within SObject
     * @returns {Table} Apex triggers in SObject table definition
     */
    static get ApexTriggersInObject() { return {
        columns: [
            { label: '#',              type: ColumnType.IDX },
            { label: 'Score',          type: ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',           type: ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'API Version',    type: ColumnType.NUM, data: { value: 'apiVersion' }, modifier: { valueIfEmpty: 'No version.' }},
            { label: 'Package',        type: ColumnType.TXT, data: { value: 'package' }},
            { label: 'Size',           type: ColumnType.NUM, data: { value: 'length' }},
            { label: 'Hardcoded URLs', type: ColumnType.TXTS, data: { values: 'hardCodedURLs' }},
            { label: 'Hardcoded IDs',  type: ColumnType.TXTS, data: { values: 'hardCodedIDs' }},
            { label: 'Active?',        type: ColumnType.CHK, data: { value: 'isActive' }},
            { label: 'Has SOQL?',      type: ColumnType.CHK, data: { value: 'hasSOQL' }},
            { label: 'Has DML?',       type: ColumnType.CHK, data: { value: 'hasDML' }},
            { label: '*Insert',        type: ColumnType.CHK, data: { value: 'beforeInsert' }},
            { label: 'Insert*',        type: ColumnType.CHK, data: { value: 'afterInsert' }},
            { label: '*Update',        type: ColumnType.CHK, data: { value: 'beforeUpdate' }},
            { label: 'Update*',        type: ColumnType.CHK, data: { value: 'afterUpdate' }},
            { label: '*Delete',        type: ColumnType.CHK, data: { value: 'beforeDelete' }},
            { label: 'Delete*',        type: ColumnType.CHK, data: { value: 'afterDelete' }},
            { label: 'Undelete',       type: ColumnType.CHK, data: { value: 'afterUndelete' }},
            { label: 'Using',          type: ColumnType.NUM, data: { value: 'dependencies.using.length' }},
            { label: 'Dependencies',   type: ColumnType.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Created date',   type: ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date',  type: ColumnType.DTM, data: { value: 'lastModifiedDate' }},
        ],
        orderIndex: 1,
        orderSort: SortOrder.DESC
    }};

    /**
     * @description Table definition for apex classes that are tests
     * @returns {Table} Apex test classes table definition
     */
    static get ApexTests() { return {
        columns: [
            { label: '#',                           type: ColumnType.IDX },
            { label: 'Score',                       type: ColumnType.SCR,  data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',                        type: ColumnType.URL,  data: { value: 'url', label: 'name' }},
            { label: 'API Version',                 type: ColumnType.NUM,  data: { value: 'apiVersion' }, modifier: { valueIfEmpty: 'No version.' }},
            { label: 'Package',                     type: ColumnType.TXT,  data: { value: 'package' }},
            { label: 'Size',                        type: ColumnType.NUM,  data: { value: 'length' }},
            { label: 'Hardcoded URLs',              type: ColumnType.TXTS, data: { values: 'hardCodedURLs' }},
            { label: 'Hardcoded IDs',               type: ColumnType.TXTS, data: { values: 'hardCodedIDs' }},
            { label: 'See All Data',                type: ColumnType.CHK,  data: { value: 'isTestSeeAllData' }},
            { label: 'Nb Asserts',                  type: ColumnType.NUM,  data: { value: 'nbSystemAsserts' }, modifier: { valueIfEmpty: 'No direct usage of Assert.Xxx() or System.assertXxx().' }},
            { label: 'Methods',                     type: ColumnType.NUM,  data: { value: 'methodsCount' }},
            { label: 'Latest Run Date',             type: ColumnType.DTM,  data: { value: 'lastTestRunDate' }},
            { label: 'Runtime',                     type: ColumnType.NUM,  data: { value: 'testMethodsRunTime' }},
            { label: 'Passed (but long) methods',   type: ColumnType.OBJS, data: { values: 'testPassedButLongMethods', template: (r) => 
                `${r.methodName} (Runtime: ${r.runtime*1} ms`+
                // see https://developer.salesforce.com/docs/atlas.en-us.api_tooling.meta/api_tooling/tooling_api_objects_apextestresultlimits.htm
                (r.cpuConsumption > 0 ? `, CPU: ${r.cpuConsumption*1} ms`: '') +  // The amount of CPU used during the test run, in milliseconds.
                (r.asyncCallsConsumption > 0 ? `, Async Calls: ${r.asyncCallsConsumption}`: '') + // The number of asynchronous calls made during the test run.
                (r.soslConsumption > 0 ? `, SOSL: ${r.soslConsumption}`: '') + // The number of SOSL queries made during the test run.
                (r.soqlConsumption > 0 ? `, SOQL: ${r.soqlConsumption}`: '') + // The number of SOQL queries made during the test run.
                (r.queryRowsConsumption > 0 ? `, Query Rows: ${r.queryRowsConsumption}`: '') + // The number of rows queried during the test run.
                (r.dmlRowsConsumption > 0 ? `, Dml Rows: ${r.dmlRowsConsumption}`: '') + // The number of rows accessed by DML statements during the test run.
                (r.dmlConsumption > 0 ? `, Dml: ${r.dmlConsumption}`:'') + // The number of DML statements made during the test run.
            ')' }},
            { label: 'Failed methods',              type: ColumnType.OBJS, data: { values: 'testFailedMethods', template: (r) => `${r.methodName} (${r.stacktrace})` }},
            { label: 'Inner Classes',               type: ColumnType.NUM,  data: { value: 'innerClassesCount' }},
            { label: 'Sharing',                     type: ColumnType.TXT,  data: { value: 'specifiedSharing' }, modifier: { valueIfEmpty: 'Not specified.' }},
            { label: 'Covering (editable classes)', type: ColumnType.URLS, data: { values: 'relatedClassRefs', value: 'url', label: 'name' }},
            { label: 'Using',                       type: ColumnType.NUM,  data: { value: 'dependencies.using.length' }},
            { label: 'Dependencies',                type: ColumnType.DEP,  data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Created date',                type: ColumnType.DTM,  data: { value: 'createdDate' }},
            { label: 'Modified date',               type: ColumnType.DTM,  data: { value: 'lastModifiedDate' }}
        ],
        orderIndex: 1,
        orderSort: SortOrder.DESC
    }};

    /**
     * @description Table definition for SObjects
     * @returns {Table} SObjects table definition
     */
    static get Objects() { return {
        columns: [
            { label: '#',                type: ColumnType.IDX },
            { label: 'Score',            type: ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Label',            type: ColumnType.URL, data: { value: 'url', label: 'label' }},
            { label: 'Name',             type: ColumnType.TXT, data: { value: 'name' }},
            { label: 'Package',          type: ColumnType.TXT, data: { value: 'package' }},
            { label: 'Custom fields',    type: ColumnType.NUM, data: { value: 'nbCustomFields' }},
            { label: 'Page layouts',     type: ColumnType.NUM, data: { value: 'nbPageLayouts' }},
            { label: 'Record types',     type: ColumnType.NUM, data: { value: 'nbRecordTypes' }},
            { label: 'Workflows',        type: ColumnType.NUM, data: { value: 'nbWorkflowRules' }},
            { label: 'Apex Triggers',    type: ColumnType.NUM, data: { value: 'nbApexTriggers' }},
            { label: 'Validation Rules', type: ColumnType.NUM, data: { value: 'nbValidationRules' }},
            { label: 'Internal OWD',     type: ColumnType.TXT, data: { value: 'internalSharingModel' }},
            { label: 'External OWD',     type: ColumnType.TXT, data: { value: 'externalSharingModel' }}
        ],
        orderIndex: 1,
        orderSort: SortOrder.DESC
    }};

    /**
     * @description Table definition for flows
     * @returns {Table} Flows table definition
     */
    static get Flows() { return {
        columns: [
            { label: '#',                                                 type: ColumnType.IDX },
            { label: 'Score',                                             type: ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',                                              type: ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'API Version',                                       type: ColumnType.NUM, data: { value: 'apiVersion' }, modifier: { valueIfEmpty: 'No version.' }},
            { label: 'Type',                                              type: ColumnType.TXT, data: { value: 'type' }},
            { label: 'Number of versions',                                type: ColumnType.NUM, data: { value: 'versionsCount' }},
            { label: 'Current Version (called `it` in the next columns)', type: ColumnType.URL, data: { value: 'currentVersionRef.url', label: 'currentVersionRef.name' }},
            { label: 'Is it Active?',                                     type: ColumnType.CHK, data: { value: 'isVersionActive' }},
            { label: 'Is it the Latest?',                                 type: ColumnType.CHK, data: { value: 'isLatestCurrentVersion' }},
            { label: 'Its SObject',                                       type: ColumnType.TXT, data: { value: 'currentVersionRef.sobject' }},
            { label: 'Its trigger type',                                  type: ColumnType.TXT, data: { value: 'currentVersionRef.triggerType' }},
            { label: 'Its record trigger type',                           type: ColumnType.TXT, data: { value: 'currentVersionRef.recordTriggerType' }},
            { label: 'Its Running Mode',                                  type: ColumnType.TXT, data: { value: 'currentVersionRef.runningMode' }, modifier: { valueIfEmpty: 'No mode specified.' }},
            { label: 'Its API Version',                                   type: ColumnType.NUM, data: { value: 'currentVersionRef.apiVersion' }, modifier: { valueIfEmpty: 'No version.' }},
            { label: '# Nodes',                                           type: ColumnType.NUM, data: { value: 'currentVersionRef.totalNodeCount' }},
            { label: '# DML Create Nodes',                                type: ColumnType.NUM, data: { value: 'currentVersionRef.dmlCreateNodeCount' }},
            { label: '# DML Delete Nodes',                                type: ColumnType.NUM, data: { value: 'currentVersionRef.dmlDeleteNodeCount' }},
            { label: '# DML Update Nodes',                                type: ColumnType.NUM, data: { value: 'currentVersionRef.dmlUpdateNodeCount' }},
            { label: '# Screen Nodes',                                    type: ColumnType.NUM, data: { value: 'currentVersionRef.screenNodeCount' }},
            { label: 'Its LFS Violations',                                type: ColumnType.TXTS, data: { values: 'currentVersionRef.lfsViolations' }},
            { label: 'Its created date',                                  type: ColumnType.DTM, data: { value: 'currentVersionRef.createdDate' }},
            { label: 'Its modified date',                                 type: ColumnType.DTM, data: { value: 'currentVersionRef.lastModifiedDate' }},
            { label: 'Its description',                                   type: ColumnType.TXT, data: { value: 'currentVersionRef.description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }},
            { label: 'Flow created date',                                 type: ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Flow modified date',                                type: ColumnType.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Flow description',                                  type: ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }},
            { label: 'Using',                                             type: ColumnType.NUM, data: { value: 'dependencies.using.length' }},
            { label: 'Referenced in',                                     type: ColumnType.NUM, data: { value: 'dependencies.referenced.length' }, modifier: { minimum: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }},
            { label: 'Dependencies',                                      type: ColumnType.DEP, data: { value: 'dependencies', id: 'currentVersionId', name: 'name' }}
        ],
        orderIndex: 1,
        orderSort: SortOrder.DESC
    }};

    /**
     * @description Table definition for email templates
     * @returns {Table} Email templates table definition
     */ 
    static get EmailTemplates() { return {
        columns: [
            { label: '#',               type: ColumnType.IDX },
            { label: 'Score',           type: ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',            type: ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'API Version',     type: ColumnType.NUM, data: { value: 'apiVersion' }, modifier: { valueIfEmpty: 'No version.' }},
            { label: 'Package',         type: ColumnType.TXT, data: { value: 'package' }},
            { label: 'UI Type',         type: ColumnType.TXT, data: { value: 'uiType' }},
            { label: 'Type',            type: ColumnType.TXT, data: { value: 'type' }},
            { label: 'Folder',          type: ColumnType.TXT, data: { value: 'folderName' }},
            { label: 'Is Active',       type: ColumnType.CHK,  data: { value: 'isActive' }},
            { label: 'Last Used',       type: ColumnType.DTM,  data: { value: 'lastUsedDate' }, modifier: { valueIfEmpty: 'Never used!' }},
            { label: 'Used',            type: ColumnType.NUM,  data: { value: 'timesUsed' }},
            { label: 'Hardcoded URLs',  type: ColumnType.TXTS, data: { values: 'hardCodedURLs' }},
            { label: 'Hardcoded IDs',   type: ColumnType.TXTS, data: { values: 'hardCodedIDs' }},
            { label: 'Created date',    type: ColumnType.DTM,  data: { value: 'createdDate' }},
            { label: 'Modified date',   type: ColumnType.DTM,  data: { value: 'lastModifiedDate' }},
            { label: 'Description',     type: ColumnType.TXT,  data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
        ],
        orderIndex: 1,
        orderSort: SortOrder.DESC
    }};

    /**
     * @description Table definition for home page components
     * @returns {Table} Home page components table definition
     */ 
    static get HomePageComponents() { return {
        columns: [
            { label: '#',               type: ColumnType.IDX },
            { label: 'Score',           type: ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',            type: ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'Package',         type: ColumnType.TXT, data: { value: 'package' }},
            { label: 'Is Body Empty?',  type: ColumnType.CHK, data: { value: 'isBodyEmpty' }},
            { label: 'Hardcoded URLs',  type: ColumnType.TXTS, data: { values: 'hardCodedURLs' }},
            { label: 'Hardcoded IDs',   type: ColumnType.TXTS, data: { values: 'hardCodedIDs' }},
            { label: 'Created date',    type: ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date',   type: ColumnType.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Using',           type: ColumnType.NUM, data: { value: 'dependencies.using.length' }},
            { label: 'Referenced in',   type: ColumnType.NUM, data: { value: 'dependencies.referenced.length' }, modifier: { minimum: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }}, 
            { label: 'Dependencies',    type: ColumnType.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }},
        ],
        orderIndex: 1,
        orderSort: SortOrder.DESC
    }};

    /**
     * @description Table definition for process builders
     * @returns {Table} Process builders table definition
     */
    static get ProcessBuilders() { return {
        columns: [
            { label: '#',                                                 type: ColumnType.IDX },
            { label: 'Score',                                             type: ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',                                              type: ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'API Version',                                       type: ColumnType.NUM, data: { value: 'apiVersion' }, modifier: { valueIfEmpty: 'No version.' }},
            { label: 'Number of versions',                                type: ColumnType.NUM, data: { value: 'versionsCount' }},
            { label: 'Current Version (called `it` in the next columns)', type: ColumnType.URL, data: { value: 'currentVersionRef.url', label: 'currentVersionRef.name' }},
            { label: 'Is it Active?',                                     type: ColumnType.CHK, data: { value: 'isVersionActive' }},
            { label: 'Is it the Latest?',                                 type: ColumnType.CHK, data: { value: 'isLatestCurrentVersion' }},
            { label: 'Its SObject',                                       type: ColumnType.TXT, data: { value: 'currentVersionRef.sobject' }},
            { label: 'Its trigger type',                                  type: ColumnType.TXT, data: { value: 'currentVersionRef.triggerType' }},
            { label: 'Its Running Mode',                                  type: ColumnType.TXT, data: { value: 'currentVersionRef.runningMode' }, modifier: { valueIfEmpty: 'No mode specified.' }},
            { label: 'Its API Version',                                   type: ColumnType.NUM, data: { value: 'currentVersionRef.apiVersion' }, modifier: { valueIfEmpty: 'No version.' }},
            { label: '# Nodes',                                           type: ColumnType.NUM, data: { value: 'currentVersionRef.totalNodeCount' }},
            { label: '# DML Create Nodes',                                type: ColumnType.NUM, data: { value: 'currentVersionRef.dmlCreateNodeCount' }},
            { label: '# DML Delete Nodes',                                type: ColumnType.NUM, data: { value: 'currentVersionRef.dmlDeleteNodeCount' }},
            { label: '# DML Update Nodes',                                type: ColumnType.NUM, data: { value: 'currentVersionRef.dmlUpdateNodeCount' }},
            { label: '# Screen Nodes',                                    type: ColumnType.NUM, data: { value: 'currentVersionRef.screenNodeCount' }},
            { label: 'Its LFS Violations',                                type: ColumnType.TXTS, data: { values: 'currentVersionRef.lfsViolations' }},
            { label: 'Its created date',                                  type: ColumnType.DTM, data: { value: 'currentVersionRef.createdDate' }},
            { label: 'Its modified date',                                 type: ColumnType.DTM, data: { value: 'currentVersionRef.lastModifiedDate' }},
            { label: 'Its description',                                   type: ColumnType.TXT, data: { value: 'currentVersionRef.description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }},
            { label: 'Process created date',                              type: ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Process modified date',                             type: ColumnType.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Using',                                             type: ColumnType.NUM, data: { value: 'dependencies.using.length' }},
            { label: 'Referenced in',                                     type: ColumnType.NUM, data: { value: 'dependencies.referenced.length' }, modifier: { minimum: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }},
            { label: 'Dependencies',                                      type: ColumnType.DEP, data: { value: 'dependencies', id: 'currentVersionId', name: 'name' }}
        ],
        orderIndex: 1,
        orderSort: SortOrder.DESC
    }};

    /**
     * @description Table definition for workflows
     * @returns {Table} Workflows table definition
     */
    static get Workflows() { return {
        columns: [
            { label: '#',                 type: ColumnType.IDX },
            { label: 'Score',             type: ColumnType.SCR,  data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',              type: ColumnType.URL,  data: { value: 'url', label: 'name' }},
            { label: 'Is Active',         type: ColumnType.CHK,  data: { value: 'isActive' }},
            { label: 'Has Actions',       type: ColumnType.CHK,  data: { value: 'hasAction' }},
            { label: 'Direct Actions',    type: ColumnType.OBJS, data: { values: 'actions', template: (r) => `${r.name} (${r.type})` }},
            { label: 'Empty Timetrigger', type: ColumnType.OBJS, data: { values: 'emptyTimeTriggers', template: (r) => `${r.field} after ${r.delay*1}` }},
            { label: 'Future Actions',    type: ColumnType.OBJS, data: { values: 'futureActions', template: (r) => `${r.field} after ${r.delay*1}: ${r.name} (${r.type})` }},
            { label: 'Created date',      type: ColumnType.DTM,  data: { value: 'createdDate' }},
            { label: 'Modified date',     type: ColumnType.DTM,  data: { value: 'lastModifiedDate' }},
            { label: 'Description',       type: ColumnType.TXT,  data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
        ],
        orderIndex: 1,
        orderSort: SortOrder.DESC
    }};

    /**
     * @description Table definition for workflows in an object
     * @returns {Table} Workflows in SObject table definition
     */
    static get WorkflowsInObject() { return {
        columns: [
            { label: '#',                 type: ColumnType.IDX },
            { label: 'Score',             type: ColumnType.SCR,  data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',              type: ColumnType.URL,  data: { value: 'url', label: 'name' }},
            { label: 'Is Active',         type: ColumnType.CHK,  data: { value: 'isActive' }},
            { label: 'Has Actions',       type: ColumnType.CHK,  data: { value: 'hasAction' }},
            { label: 'Direct Actions',    type: ColumnType.OBJS, data: { values: 'actions', template: (r) => `${r.name} (${r.type})` }},
            { label: 'Empty Timetrigger', type: ColumnType.OBJS, data: { values: 'emptyTimeTriggers', template: (r) => `${r.field} after ${r.delay*1}` }},
            { label: 'Future Actions',    type: ColumnType.OBJS, data: { values: 'futureActions', template: (r) => `${r.field} after ${r.delay*1}: ${r.name} (${r.type})` }},
            { label: 'Created date',      type: ColumnType.DTM,  data: { value: 'createdDate' }},
            { label: 'Modified date',     type: ColumnType.DTM,  data: { value: 'lastModifiedDate' }},
            { label: 'Description',       type: ColumnType.TXT,  data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
        ],
        orderIndex: 1,
        orderSort: SortOrder.DESC
    }};

    /**
     * @description Table definition for roles
     * @returns {Table} Roles table definition
     */
    static get Roles() { return {
        columns: [
            { label: '#',                           type: ColumnType.IDX },
            { label: 'Score',                       type: ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',                        type: ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'Developer Name',              type: ColumnType.TXT, data: { value: 'apiname' }},
            { label: 'Number of active members',    type: ColumnType.NUM, data: { value: 'activeMembersCount' }},
            { label: 'Level',                       type: ColumnType.NUM, data: { value: 'level' }},
            { label: 'Parent',                      type: ColumnType.URL, data: { value: 'parentRef.url', label: 'parentRef.name' }}
        ],
        orderIndex: 1,
        orderSort: SortOrder.DESC
    }};

    /**
     * @description Table definition for object permissions
     * @param {DataMatrix} dataMatrix - matrix containing dynamic column headers and the data
     * @returns {Table} Object permissions table definition
     */
    static ObjectPermissions(dataMatrix) {
        /** @type {Table} */
        const table = {
            columns: [
                { label: 'Parent',  type: ColumnType.URL, data: { value: 'header.url', label: 'header.name' }},
                { label: 'Package', type: ColumnType.TXT, data: { value: 'header.package' }},
                { label: 'Type',    type: ColumnType.TXT, data: { value: 'header.type' }},
                { label: 'Custom',  type: ColumnType.CHK, data: { value: 'header.isCustom' }}
            ],
            orderIndex: 1,
            orderSort: SortOrder.ASC
        };
        if (dataMatrix) {
            dataMatrix.columnHeaders // returns an array of string representing Object Api names
                .sort()
                .forEach((/** @type {string} */ objectApiName) => {
                    table.columns.push({ 
                        label: objectApiName, 
                        type: ColumnType.TXT, 
                        data: { 
                            value: `data.${objectApiName}` 
                        }, 
                        orientation: Orientation.VERTICAL 
                    });
                });
        }
        return table;
    };

    /**
     * @description Table definition for application permissions
     * @param {DataMatrix} dataMatrix - matrix containing dynamic column headers and the data
     * @returns {Table} Application permissions table definition
     */
    static AppPermissions(dataMatrix) {
        /** @type {Table} */
        const table = {
            columns: [
                { label: 'Parent',  type: ColumnType.URL, data: { value: 'header.url', label: 'header.name' }},
                { label: 'Package', type: ColumnType.TXT, data: { value: 'header.package' }},
                { label: 'Type',    type: ColumnType.TXT, data: { value: 'header.type' }},
                { label: 'Custom',  type: ColumnType.CHK, data: { value: 'header.isCustom' }}
            ],
            orderIndex: 1,
            orderSort: SortOrder.ASC
        };
        if (dataMatrix) {
            dataMatrix.columnHeaders // returns an array of Object like {id: string, label: string} representing an Application
                .sort((/** @type {{id: string, label: string}} */ a, /** @type {{id: string, label: string}} */b) => { 
                    return a.label < b.label ? -1: 1; 
                })
                .forEach((/** @type {{id: string, label: string}} */ app) => {
                    table.columns.push({ 
                        label: app.label, 
                        type: ColumnType.TXT, 
                        data: { 
                            value: `data.${app.id}` 
                        }, 
                        orientation: Orientation.VERTICAL 
                    });
                });
        }
        return table;
    };
    
    /**
     * @description Table definition for field permissions
     * @param {DataMatrix} dataMatrix - matrix containing dynamic column headers and the data
     * @returns {Table} Field permissions table definition
     */
    static FieldPermissions(dataMatrix) {
        /** @type {Table} */
        const table = {
            columns: [
                { label: 'Parent',  type: ColumnType.URL, data: { value: 'header.url', label: 'header.name' }},
                { label: 'Package', type: ColumnType.TXT, data: { value: 'header.package' }},
                { label: 'Type',    type: ColumnType.TXT, data: { value: 'header.type' }},
                { label: 'Custom',  type: ColumnType.CHK, data: { value: 'header.isCustom' }}
            ],
            orderIndex: 1,
            orderSort: SortOrder.ASC
        };
        if (dataMatrix) {
            dataMatrix.columnHeaders // returns an array of string representing Field Api names
                .sort()
                .forEach((/** @type {string} */ fieldApiName) => {
                    table.columns.push({ 
                        label: fieldApiName, 
                        type: ColumnType.TXT, 
                        data: { 
                            value: `data.${fieldApiName}` 
                        }, 
                        orientation: Orientation.VERTICAL 
                    });
                });
        }
        return table;
    };

    /**
     * @description Table definition for score rules
     * @param {DataMatrix} dataMatrix - matrix containing dynamic column headers and the data
     * @returns {Table} Score rules table definition
     */
    static ScoreRules(dataMatrix) {
        /** @type {Table} */
        const table = {
            columns: [
                { label: 'Rules (or reason why metadata is bad)', type: ColumnType.TXT, data: { value: 'header.description' }}
            ],
            orderIndex: 0,
            orderSort: SortOrder.ASC
        };
        if (dataMatrix) {
            dataMatrix.columnHeaders // returns an array of string representing the static 'label' of the org check class
                .sort()
                .forEach((/** @type {string} */ classLabel) => {
                    table.columns.push({ 
                        label: classLabel, 
                        type: ColumnType.CHK, 
                        data: { 
                            value: `data.${classLabel}` 
                        }, orientation: Orientation.VERTICAL 
                    });
                });
        }
        return table;
    };

    /**
     * @description Table definition for hardcoded url view
     * @param {number} nbMaxItems - number of items to show in the URLs column
     * @returns {Table} Hardcoded URLs table definition
     */
    static HardCodedURLsView(nbMaxItems) { return {
        columns: [
            { label: 'Type',      type: ColumnType.TXT, data: { value: 'type' }},
            { label: 'Had Issue', type: ColumnType.CHK, data: { value: 'hadError' }},
            { label: 'Bad',       type: ColumnType.NUM, data: { value: 'countBad' }},
            { label: 'Total',     type: ColumnType.NUM, data: { value: 'countAll' }},
            { label: `First ${nbMaxItems} items...`, type: ColumnType.URLS, data: { values: 'items', value: 'url', label: 'name' }}
        ],
        orderIndex: 2,
        orderSort: SortOrder.DESC
    }};
}