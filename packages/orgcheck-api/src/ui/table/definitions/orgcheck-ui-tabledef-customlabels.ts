import { ColumnType } from "src/ui/table/orgcheck-ui-table-columntype";
import { Table } from "src/ui/table/orgcheck-ui-table";
import { SortOrder } from "src/ui/table/orgcheck-ui-table-sortorder";
import { TableColumn } from "src/ui/table/orgcheck-ui-table-column";
import { SalesforceMetadataTypes } from "src/api/core/orgcheck-api-salesforce-metadatatypes";

export class CustomLabelsTableDefinitions implements Table {
    
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn> = [
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
        { label: 'Ref. in Layout?',     type: ColumnType.NUM, data: { value: `dependencies.referencedByTypes.${SalesforceMetadataTypes.PAGE_LAYOUT}`}},
        { label: 'Ref. in Apex Class?', type: ColumnType.NUM, data: { value: `dependencies.referencedByTypes.${SalesforceMetadataTypes.APEX_CLASS}`}},
        { label: 'Ref. in Flow?',       type: ColumnType.NUM, data: { value: `dependencies.referencedByTypes.${SalesforceMetadataTypes.FLOW_VERSION}`}},
        { label: 'Dependencies',        type: ColumnType.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }},
        { label: 'Created date',        type: ColumnType.DTM, data: { value: 'createdDate' }},
        { label: 'Modified date',       type: ColumnType.DTM, data: { value: 'lastModifiedDate' }},
        { label: 'Value',               type: ColumnType.TXT, data: { value: 'value'}, modifier: { maximumLength: 45, preformatted: true }}
    ];

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