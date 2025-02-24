import { TableColumn, TableColumnWithData, TableColumnWithModifiers, TableColumnWithOrientation } from "./orgcheck-ui-table-column";

export const SortOrder = {
    DESC: 'desc',
    ASC: 'asc'
}

export class Table {

    /**
     * @description List of columns in a table
     * @type {Array<TableColumn | TableColumnWithData | TableColumnWithModifiers | TableColumnWithOrientation>}
     */
    columns;

    /**
     * @description Which index column is used for ordering?
     * @type {number}
     */
    orderIndex;

    /**
     * @description What is the sort order: ASC or DESC?
     * @see SortOrder
     * @type {string}
     */
    orderSort;
}