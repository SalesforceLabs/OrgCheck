import { Table } from "src/ui/table/orgcheck-ui-table";
import { TableColumn } from "src/ui/table/orgcheck-ui-table-column";
import { ColumnType } from "src/ui/table/orgcheck-ui-table-columntype";
import { SortOrder } from "src/ui/table/orgcheck-ui-table-sortorder";

export class GlobalViewItemsTableDefinitions implements Table {
    
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn> = [
        { label: 'Items', type: ColumnType.NUM, data: { value: 'value' }},
        { label: 'What is the issue?', type: ColumnType.TXT, data: { value: 'name' }}
    ];

    /**
     * @description Which index column is used for ordering?
     * @type {number}
     */
    orderIndex: number = 0;
    
    /**
     * @description What is the sort order: ASC or DESC?
     * @type {SortOrder}
     */
    orderSort: SortOrder = SortOrder.DESC;
}