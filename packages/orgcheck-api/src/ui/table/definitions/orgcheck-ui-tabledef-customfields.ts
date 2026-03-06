import { ColumnType } from "src/ui/table/orgcheck-ui-table-columntype";
import { Table } from "src/ui/table/orgcheck-ui-table";
import { SortOrder } from "src/ui/table/orgcheck-ui-table-sortorder";
import { TableColumn } from "src/ui/table/orgcheck-ui-table-column";
import { SalesforceMetadataTypes } from "src/api/core/orgcheck-api-salesforce-metadatatypes";

class AbstractCustomFieldsTableDefinitions implements Table {
    
    /**
     * @description Constructor to specify if this table is in a context of an object. 
     * @param {boolean} isObjectInformationNeeded - Is the object information needed in the table (true by default)
     */
    constructor(isObjectInformationNeeded: boolean) {
        this.columns = [
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
            { label: 'Hardcoded URLs',      type: ColumnType.TXTS, data: { values: 'hardCodedURLs', value: '.' }},
            { label: 'Hardcoded IDs',       type: ColumnType.TXTS, data: { values: 'hardCodedIDs', value: '.' }},
            { label: 'Default Value',       type: ColumnType.TXT, data: { value: 'defaultValue' }},
            { label: 'Using',               type: ColumnType.NUM, data: { value: 'dependencies.using.length' }},
            { label: 'Referenced in',       type: ColumnType.NUM, data: { value: 'dependencies.referenced.length' }, modifier: { minimum: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }},
            { label: 'Ref. in Layout?',     type: ColumnType.NUM, data: { value: `dependencies.referencedByTypes.${SalesforceMetadataTypes.PAGE_LAYOUT}` }}, 
            { label: 'Ref. in Apex Class?', type: ColumnType.NUM, data: { value: `dependencies.referencedByTypes.${SalesforceMetadataTypes.APEX_CLASS}` }}, 
            { label: 'Ref. in Flow?',       type: ColumnType.NUM, data: { value: `dependencies.referencedByTypes.${SalesforceMetadataTypes.FLOW_VERSION}` }}, 
            { label: 'Dependencies',        type: ColumnType.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Created date',        type: ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date',       type: ColumnType.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Description',         type: ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
        ];
        if (isObjectInformationNeeded === true) {
            this.columns.splice(5, 0, // between package and type
                { label: 'Object API Name',     type: ColumnType.TXT, data: { value: 'objectId' }}, 
                { label: 'Object Name',         type: ColumnType.URL, data: { value: 'objectRef.url', label: 'objectRef.name' }, modifier: { valueIfEmpty: 'N/A' }}, 
                { label: 'Object Type',         type: ColumnType.TXT, data: { value: 'objectRef.typeRef.label' }, modifier: { valueIfEmpty: 'N/A' }}
            );
        }
    }

    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn>;

    /**
     * @description Which index column is used for ordering?
     * @type {number}
     */
    orderIndex: number = 1;
    
    /**
     * @description What is the sort order: ASC or DESC?
     * @type {SortOrder}
     */
    orderSort: SortOrder = SortOrder.ASC;
}

export class CustomFieldsTableDefinitions extends AbstractCustomFieldsTableDefinitions {
    constructor() {
        super(false);
    }
}

export class CustomFieldsInObjectTableDefinitions extends AbstractCustomFieldsTableDefinitions {
    constructor() {
        super(true);
    }
}