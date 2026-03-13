import { ColumnType } from "src/ui/table/orgcheck-ui-table-columntype";
import { Table } from "src/ui/table/orgcheck-ui-table";
import { SortOrder } from "src/ui/table/orgcheck-ui-table-sortorder";
import { TableColumn } from "src/ui/table/orgcheck-ui-table-column";

export class DocumentsTableDefinitions implements Table {
    
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn> = [
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
    orderSort: SortOrder = SortOrder.DESC;
}