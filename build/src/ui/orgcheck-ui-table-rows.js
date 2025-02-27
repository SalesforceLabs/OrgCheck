import { Table, SortOrder, ExportedTable } from "./orgcheck-ui-table";
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
     * @param {Array<any>} records 
     * @param {Function} onEachRowCallback
     * @param {Function} onEachCellCallback
     * @returns {Array<Row>}
     */
    static create(tableDefinition, records, onEachRowCallback, onEachCellCallback) {
        return records.map((record, rIndex) => {
            const row = {
                index: rIndex+1, // 1-based index of the current row (should be recalculated after sorting)
                score: record.score, // score is a global KPI at the row level (not at a cell i mean)
                badFields: record.badFields, // needed to see the score explaination in a modal
                badReasonIds: record.badReasonIds, // needed to see the score explaination in a modal
                cells: tableDefinition.columns.map((column, cIndex) => {
                    const cell = CellFactory.create(column, record);
                    // Potentially alter the cell
                    onEachCellCallback(
                        cell, 
                        column['data'] ? record.badFields?.includes(column['data'].value) : false,
                        rIndex,
                        cIndex
                    );
                    // Finally return the cell
                    return cell;
                }),
                isVisible: true
            }
            // Potentially alter the row
            if (onEachRowCallback) onEachRowCallback(row, record.score > 0, rIndex);
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

    /**
     * @description Export table
     * @param {Table} tableDefintion
     * @param {Array<Row>} rows
     * @param {string} title 
     * @returns {ExportedTable}
     */ 
    static export(tableDefintion, rows, title) {
        return {
            header: title,
            columns: tableDefintion.columns.map(c => c.label),
            rows: rows.map((row) => row.cells?.map(cell => {
                if (cell.typeofindex) return row.index;
                if (cell.typeofscore) return `${row.score} (badField=${JSON.stringify(row.badFields)}, badReasonIds=${JSON.stringify(row.badReasonIds)})`;
                if (cell.typeofid) return `${cell.data.label} (${cell.data.value})`;
                if (cell.typeofids) return JSON.stringify(cell.data.values?.map(v => `${v.data.label} (${v.data.value})`));
                if (cell.typeofobjects) return JSON.stringify(cell.data.values?.map(v => v.data.value));
                if (cell.typeoftexts) return JSON.stringify(cell.data.values?.map(v => v.data));
                if (cell.data.value) return cell.data.value;
                return '';
            }))
        };
    }

    /**
     * @description Export table
     * @param {Table} tableDefintion
     * @param {Array<Row>} records
     * @param {string} title 
     * @returns {ExportedTable}
     */ 
    static createAndExport(tableDefintion, records, title) {
        const donothing = () => {};
        const rows = RowsFactory.create(tableDefintion, records, donothing, donothing);
        return RowsFactory.export(tableDefintion, rows, title);
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