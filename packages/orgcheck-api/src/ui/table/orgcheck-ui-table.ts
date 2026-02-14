import { TableColumn, TableColumnWithModifiers, TableColumnWithOrientation } from "./orgcheck-ui-table-column";

export const SortOrder = {
    DESC: 'desc',
    ASC: 'asc'
}

export class Table {

    /**
     * @description List of columns in a table
     * @type {Array<TableColumn | TableColumnWithModifiers | TableColumnWithOrientation>}
     */
    columns: Array<TableColumn | TableColumnWithModifiers | TableColumnWithOrientation>;

    /**
     * @description Which index column is used for ordering?
     * @type {number}
     */
    orderIndex: number;

    /**
     * @description What is the sort order: ASC or DESC?
     * @see SortOrder
     * @type {string}
     */
    orderSort: string;
}

export class ExportedTable {

    /**
     * @description Name of the exported table (like a title)
     * @type {string}
     */
    header: string;

    /**
     * @description List of column labels
     * @type {Array<string>}
     */
    columns: Array<string>;

    /**
     * @description List of rows with cells
     * @type {Array<Array<string>>}
     */
    rows: Array<Array<string>>;
}