import { TableColumn, TableColumnWithModifiers, TableColumnWithOrientation } from "./orgcheck-ui-tablecolumn";

export const SortOrder = {
    DESC: 'desc',
    ASC: 'asc'
}

export class Table {

    /**
     * @description List of columns in a table
     * @type {Array<TableColumn | TableColumnWithModifiers | TableColumnWithOrientation>}
     */
    columns;
}

export class TableWithOrdering extends Table {

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