import { ColumnType } from "src/ui/table/orgcheck-ui-table-columntype";
import { Table } from "src/ui/table/orgcheck-ui-table";
import { SortOrder } from "src/ui/table/orgcheck-ui-table-sortorder";
import { TableColumn } from "src/ui/table/orgcheck-ui-table-column";

export class BrowsersTableDefinitions implements Table {
    
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn> = [
        { label: '#',                   type: ColumnType.IDX },
        { label: 'Score',               type: ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
        { label: 'Full name',           type: ColumnType.TXT, data: { value: 'fullName' }},
        { label: 'Name',                type: ColumnType.TXT, data: { value: 'name' }},
        { label: 'Version',             type: ColumnType.NUM, data: { value: 'version' }},
        { label: '#Application Logins', type: ColumnType.NUM, data: { value: 'nbApplicationLogin' }}
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