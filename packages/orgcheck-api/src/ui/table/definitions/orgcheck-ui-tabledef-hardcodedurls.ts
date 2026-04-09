import { ColumnType } from 'src/ui/table/column/orgcheck-ui-table-columntype';
import { TableDefinition } from 'src/ui/table/orgcheck-ui-table-definition';
import { SortOrder } from 'src/ui/table/orgcheck-ui-table-sortorder';
import { TableColumn } from 'src/ui/table/column/orgcheck-ui-table-column';

export class HardCodedURLsTableDefinition implements TableDefinition {
    
    /**
     * @description List of columns in a table
     * @type {TableColumn[]}
     */
    columns: TableColumn[] = [
        { label: 'Type of items', type: ColumnType.TXT, data: { value: 'name' }}, 
        { label: '✅ count', type: ColumnType.NUM, data: { value: 'countGood' }},
        { label: '❌ count', type: ColumnType.NUM, data: { value: 'countBad' }},
        { label: 'Items', type: ColumnType.URLS, data: { values: 'badItems', value: 'url', label: 'name' }},
        { label: 'URLs found', type: ColumnType.TXTS, data: { values: 'badValues', value: '.' }}
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