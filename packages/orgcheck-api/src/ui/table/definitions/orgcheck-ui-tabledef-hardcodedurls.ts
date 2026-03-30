import { ColumnType } from "src/ui/table/column/orgcheck-ui-table-columntype";
import { TableDefinition } from "src/ui/table/orgcheck-ui-table-definition";
import { SortOrder } from "src/ui/table/orgcheck-ui-table-sortorder";
import { TableColumn } from "src/ui/table/column/orgcheck-ui-table-column";

export class HardCodedURLsTableDefinition implements TableDefinition {
    
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn> = [
        { label: 'Type',           type: ColumnType.TXT, data: { value: 'type' }},
        { label: 'Had Issue',      type: ColumnType.CHK, data: { value: 'hadError' }},
        { label: 'Bad',            type: ColumnType.NUM, data: { value: 'countBad' }},
        { label: 'Total',          type: ColumnType.NUM, data: { value: 'countAll' }},
        { label: 'Bad URLs',       type: ColumnType.TXTS, data: { values: 'distinctBadValues', value: '.' }},
        { label: 'First items...', type: ColumnType.URLS, data: { values: 'items', value: 'url', label: 'name' }}
    ];

    /**
     * @description Which index column is used for ordering?
     * @type {number}
     */
    orderIndex: number = 2;
    
    /**
     * @description What is the sort order: ASC or DESC?
     * @type {SortOrder}
     */
    orderSort: SortOrder = SortOrder.DESC;
}