import { ColumnType } from "src/ui/table/orgcheck-ui-table-columntype";
import { Table } from "src/ui/table/orgcheck-ui-table";
import { SortOrder } from "src/ui/table/orgcheck-ui-table-sortorder";
import { TableColumn } from "src/ui/table/orgcheck-ui-table-column";

export class LimitsTableDefinitions implements Table {
    
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn> = [
        { label: '#',         type: ColumnType.IDX },
        { label: 'Score',     type: ColumnType.SCR, data: { value: 'score', id: 'id', name: 'label' }},
        { label: 'Label',     type: ColumnType.TXT, data: { value: 'label' }},
        { label: 'Type',      type: ColumnType.TXT, data: { value: 'type' }},
        { label: 'Max',       type: ColumnType.NUM, data: { value: 'max' }},
        { label: 'Used',      type: ColumnType.NUM, data: { value: 'used' }},
        { label: 'Used (%)',  type: ColumnType.PRC, data: { value: 'usedPercentage' }},
        { label: 'Remaining', type: ColumnType.NUM, data: { value: 'remaining' }}
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