import { Row } from 'src/ui/table/row/orgcheck-ui-table-row';
import { TableDefinition } from 'src/ui/table/orgcheck-ui-table-definition';
import { SortOrder } from 'src/ui/table/orgcheck-ui-table-sortorder';

export interface Table {

    /**
     * @description Name of the exported table (like a title)
     * @type {string}
     * @public
     */
    name: string;

    /**
     * @description Definition of the table with columns and ordering information
     * @type {TableDefinition}
     * @public
     */
    definition: TableDefinition;

    /**
     * @description Which index column is used for current ordering?
     * @type {number}
     */
    orderIndex: number;
    
    /**
     * @description What is the current sort order: ascending or descending?
     * @type {SortOrder}
     */
    orderSort: SortOrder;

    /**
     * @description List of rows in a table
     * @type {Row[]}
     * @public
     */
    rows: Row[];

    /**
     * @description Number of all rows (before filtering)
     * @type {number}
     * @public
     */
    nbAllRows: number;

    /**
     * @description Indicates if the data has at least one row (filtered or not)
     * @type {boolean}
     * @public
     */
    hasData: boolean;

    /**
     * @description Number of rows after filtering (if no filter is applied, then nbFilteredRows should be equal to nbAllRows)
     * @type {number}
     * @public
     */
    nbFilteredRows: number;

    /**
     * @description Number of bad rows in the table
     * @type {number}
     * @public
     */
    nbBadRows: number;

    /**
     * @description Indicates if filtering is active
     * @type {boolean}
     * @public
     */
    isFilterOn: boolean;

    /**
     * @description Indicates if the filtered data is empty
     * @type {boolean}
     * @public
     */
    isFilteredDataEmpty: boolean;
}

export interface ExportedTable {

    /**
     * @description Name of the exported table (like a title)
     * @type {string}
     */
    label: string;

    /**
     * @description List of column labels
     * @type {string[]}
     */
    columns: string[];

    /**
     * @description List of rows with cells
     * @type {string[][]}
     */
    rows: string[][];
}