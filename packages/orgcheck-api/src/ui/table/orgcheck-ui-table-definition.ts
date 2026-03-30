import { TableColumn } from 'src/ui/table/column/orgcheck-ui-table-column';
import { SortOrder } from 'src/ui/table/orgcheck-ui-table-sortorder';

export interface TableDefinition {

    /**
     * @description List of columns in a table
     * @type {TableColumn[]}
     * @public
     */
    columns: TableColumn[];

    /**
     * @description Which index column is used for initial ordering?
     * @type {number}
     */
    orderIndex: number;
    
    /**
     * @description What is the initial sort order: ascending or descending?
     * @type {SortOrder}
     */
    orderSort: SortOrder;
}