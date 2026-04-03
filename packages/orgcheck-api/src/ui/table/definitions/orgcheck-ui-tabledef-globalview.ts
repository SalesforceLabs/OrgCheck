import { TableDefinition } from 'src/ui/table/orgcheck-ui-table-definition';
import { TableColumn } from 'src/ui/table/column/orgcheck-ui-table-column';
import { ColumnType } from 'src/ui/table/column/orgcheck-ui-table-columntype';
import { SortOrder } from 'src/ui/table/orgcheck-ui-table-sortorder';

export class GlobalViewGlobalTableDefinition implements TableDefinition {
    
    /**
     * @description List of columns in a table
     * @type {TableColumn[]}
     */
    columns: TableColumn[] = [
        { label: 'Type of items', type: ColumnType.TXT, data: { value: 'name' }}, 
        { label: 'Count of good items', type: ColumnType.NUM, data: { value: 'countGood' }},
        { label: 'Count of bad items', type: ColumnType.NUM, data: { value: 'countBad' }} 
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

export class GlobalViewPerRuleTableDefinition implements TableDefinition {
    
    /**
     * @description List of columns in a table
     * @type {TableColumn[]}
     */
    columns: TableColumn[] = [
        { label: 'Type of items', type: ColumnType.TXT, data: { value: 'name' }},
        { label: 'Why are they considered bad?', type: ColumnType.TXT, data: { value: 'ruleName' }},
        { label: 'Count of bad items', type: ColumnType.NUM, data: { value: 'countBad' }}
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