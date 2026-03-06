import { ColumnType } from "src/ui/table/orgcheck-ui-table-columntype";
import { Table } from "src/ui/table/orgcheck-ui-table";
import { SortOrder } from "src/ui/table/orgcheck-ui-table-sortorder";
import { TableColumn } from "src/ui/table/orgcheck-ui-table-column";

export class EmailTemplatesTableDefinitions implements Table {
    
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn> = [
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
        { label: 'Hardcoded URLs',  type: ColumnType.TXTS, data: { values: 'hardCodedURLs', value: '.' }},
        { label: 'Hardcoded IDs',   type: ColumnType.TXTS, data: { values: 'hardCodedIDs', value: '.' }},
        { label: 'Created date',    type: ColumnType.DTM,  data: { value: 'createdDate' }},
        { label: 'Modified date',   type: ColumnType.DTM,  data: { value: 'lastModifiedDate' }},
        { label: 'Description',     type: ColumnType.TXT,  data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
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