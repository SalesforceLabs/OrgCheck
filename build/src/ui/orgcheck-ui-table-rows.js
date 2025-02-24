import { Table, SortOrder } from "./orgcheck-ui-table";
import { CellFactory } from "./orgcheck-ui-table-cell";
import { ColumnType } from './orgcheck-ui-table-column';

export class Row {

    /** @type {number} */
    index;

    /** @type {number} */
    score;

    /** @type {Array<string>} */
    badFields;

    /** @type {Array<string>} */
    badReasonIds;

    /** @type {Array<any>} */
    cells;

    /** @type {boolean} */
    isVisible;
}

export class RowsFactory {

    /**
     * @description Create the rows of a table
     * @param {Table} tableDefinition
     * @param {Array<any>} rows 
     * @param {Function} onEachRowCallback
     * @param {Function} onEachCellCallback
     * @returns {Array<Row>}
     */
    static create(tableDefinition, rows, onEachRowCallback, onEachCellCallback) {
        return rows.map((record, rIndex) => {
            const row = {
                index: rIndex+1, // 1-based index of the current row (should be recalculated after sorting)
                score: record.score, // score is a global KPI at the row level (not at a cell i mean)
                badFields: record.badFields, // needed to see the score explaination in a modal
                badReasonIds: record.badReasonIds, // needed to see the score explaination in a modal
                cells: tableDefinition.columns.map((column, cIndex) => {
                    const cell = CellFactory.create(column, record);
                    cell.index = `${rIndex}.${cIndex}`;
                    // Potentially alter the cell
                    onEachCellCallback(cell, column['data'] ? record.badFields?.includes(column['data'].value) : false);
                    // Finally return the cell
                    return cell;
                }),
                isVisible: true
            }
            // Potentially alter the row
            if (onEachRowCallback) onEachRowCallback(row, record.score > 0);
            // Finally return the row
            return row;
        });
    }

    /**
     * @description Sort table
     * @param {Table} tableDefintion
     * @param {Array<Row>} rows
     * @param {number} columnIndex 
     * @param {string} order
     */ 
    static sort(tableDefintion, rows,  columnIndex, order) {
        const iOrder = order === SortOrder.ASC ? 1 : -1;
        const columnType = tableDefintion.columns[columnIndex].type;
        const isIterative = columnType == ColumnType.OBJS || columnType == ColumnType.TXTS || columnType == ColumnType.URLS;
        const property = columnType == ColumnType.URL ? 'label' : 'value';
        let index = 0;
        let value1, value2;
        return rows.sort((row1, row2) => {
            if (isIterative === true) {
                value1 = row1.cells[columnIndex].data?.values?.length || 0;
                value2 = row2.cells[columnIndex].data?.values?.length || 0;
            } else {
                value1 = row1.cells[columnIndex].data[property];
                value2 = row2.cells[columnIndex].data[property];
            }
            if (value1 && value1.toUpperCase) value1 = value1.toUpperCase();
            if (value2 && value2.toUpperCase) value2 = value2.toUpperCase();
            if (!value1 && value1 !== 0) return iOrder;
            if (!value2 && value2 !== 0) return -iOrder;
            return (value1 < value2 ? -iOrder : iOrder);
        }).forEach((row) => { 
            if (row.isVisible === true) {
                row.index = ++index; 
            }
        });
    }

    /**
     * @description Filter table
     * @param {Array<Row>} rows
     * @param {string} searchInput
     */ 
    static filter(rows, searchInput) {
        if (searchInput?.length > 2) {
            const s = searchInput.toUpperCase();
            let index = 0;                   
            rows.forEach((row) => {
                if (ARRAY_MATCHER(row.cells, s) === true) {
                    row.isVisible = true;
                    row.index = ++index;
                } else {
                    row.isVisible = false;
                }
            });
        } else {
            rows.forEach((row, index) => { 
                row.isVisible = true;
                row.index = index+1;
            });
        }
    }
}

const STRING_MATCHER = (value, searchingValue) => {
    return String(value).toUpperCase().indexOf(searchingValue) >= 0;
}

const ARRAY_MATCHER = (array, s) => {
    return array.findIndex((item) => {
        return Object.values(item.data).findIndex((property) => {
            if (Array.isArray(property)) {
                return ARRAY_MATCHER(property, s);
            }
            return STRING_MATCHER(property, s);
        }) >= 0;
    }) >= 0
}