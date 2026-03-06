import { ColumnType } from "src/ui/table/orgcheck-ui-table-columntype";
import { Table } from "src/ui/table/orgcheck-ui-table";
import { SortOrder } from "src/ui/table/orgcheck-ui-table-sortorder";
import { TableColumn } from "src/ui/table/orgcheck-ui-table-column";

export class WorkflowsTableDefinitions implements Table {
    
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn> = [
        { label: '#',                 type: ColumnType.IDX },
        { label: 'Score',             type: ColumnType.SCR,  data: { value: 'score', id: 'id', name: 'name' }},
        { label: 'Name',              type: ColumnType.URL,  data: { value: 'url', label: 'name' }},
        { label: 'Is Active',         type: ColumnType.CHK,  data: { value: 'isActive' }},
        { label: 'Has Actions',       type: ColumnType.CHK,  data: { value: 'hasAction' }},
        { label: 'Direct Actions',    type: ColumnType.OBJS, data: { values: 'actions', value: '.', template: (r) => `${r.name} (${r.type})` }},
        { label: 'Empty Timetrigger', type: ColumnType.OBJS, data: { values: 'emptyTimeTriggers', value: '.', template: (r) => `${r.field} after ${r.delay*1}` }},
        { label: 'Future Actions',    type: ColumnType.OBJS, data: { values: 'futureActions', value: '.', template: (r) => `${r.field} after ${r.delay*1}: ${r.name} (${r.type})` }},
        { label: 'Created date',      type: ColumnType.DTM,  data: { value: 'createdDate' }},
        { label: 'Modified date',     type: ColumnType.DTM,  data: { value: 'lastModifiedDate' }},
        { label: 'Description',       type: ColumnType.TXT,  data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
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