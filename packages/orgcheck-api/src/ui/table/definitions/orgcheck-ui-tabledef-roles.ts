import { ColumnType } from "src/ui/table/orgcheck-ui-table-columntype";
import { Table } from "src/ui/table/orgcheck-ui-table";
import { SortOrder } from "src/ui/table/orgcheck-ui-table-sortorder";
import { TableColumn } from "src/ui/table/orgcheck-ui-table-column";

export class RolesTableDefinitions implements Table {
    
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn> = [
        { label: '#',                           type: ColumnType.IDX },
        { label: 'Score',                       type: ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
        { label: 'Name',                        type: ColumnType.URL, data: { value: 'url', label: 'name' }},
        { label: 'Developer Name',              type: ColumnType.TXT, data: { value: 'apiname' }},
        { label: 'Number of active members',    type: ColumnType.NUM, data: { value: 'activeMembersCount' }},
        { label: 'Level',                       type: ColumnType.NUM, data: { value: 'level' }},
        { label: 'Parent',                      type: ColumnType.URL, data: { value: 'parentRef.url', label: 'parentRef.name' }}
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