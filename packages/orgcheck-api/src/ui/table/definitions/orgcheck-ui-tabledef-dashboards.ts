import { ColumnType } from 'src/ui/table/column/orgcheck-ui-table-columntype';
import { TableDefinition } from 'src/ui/table/orgcheck-ui-table-definition';
import { SortOrder } from 'src/ui/table/orgcheck-ui-table-sortorder';
import { TableColumn } from 'src/ui/table/column/orgcheck-ui-table-column';

export class DashboardsTableDefinition implements TableDefinition {
    
    /**
     * @description List of columns in a table
     * @type {TableColumn[]}
     */
    columns: TableColumn[] = [
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