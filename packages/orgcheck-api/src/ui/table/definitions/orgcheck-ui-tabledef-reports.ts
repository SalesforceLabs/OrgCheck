import { ColumnType } from "src/ui/table/orgcheck-ui-table-columntype";
import { Table } from "src/ui/table/orgcheck-ui-table";
import { SortOrder } from "src/ui/table/orgcheck-ui-table-sortorder";
import { TableColumn } from "src/ui/table/orgcheck-ui-table-column";

export class ReportsTableDefinitions implements Table {
    
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn> = [
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