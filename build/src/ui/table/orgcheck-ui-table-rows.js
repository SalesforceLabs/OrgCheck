import { Table, SortOrder, ExportedTable } from "./orgcheck-ui-table";
import { CellFactory } from "./orgcheck-ui-table-cell";
import { ColumnType } from './orgcheck-ui-table-column';

export class Row {

    /** @type {number} */
    index;

    /** @type {string} */
    name;

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
     * @param {Table} tableDefinition - Definition of the table
     * @param {Array<any>} records - List of records
     * @param {Function} onEachRowCallback - Callback to be called for each row
     * @param {Function} onEachCellCallback - Callback to be called for each cell
     * @returns {Array<Row>} List of rows
     */
    static create(tableDefinition, records, onEachRowCallback, onEachCellCallback) {
        return records.map((record, rIndex) => {
            const row = {
                index: rIndex+1, // 1-based index of the current row (should be recalculated after sorting)
                score: record.score, // score is a global KPI at the row level (not at a cell i mean)
                name : record.name ?? record.label, // try to get the "name" of that record
                badFields: record.badFields, // needed to see the score explaination in a modal
                badReasonIds: record.badReasonIds, // needed to see the score explaination in a modal
                cells: tableDefinition.columns.map((column, cIndex) => {
                    const cell = CellFactory.create(column, record);
                    // Potentially alter the cell
                    onEachCellCallback(
                        cell, 
                        (column['data'] && record.badFields) ? ( record.badFields.includes(column['data'].value) || record.badFields.includes(column['data'].values)) : false,
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
     * @param {Table} tableDefintion - Definition of the table
     * @param {Array<Row>} rows - List of rows
     * @param {number} columnIndex - Index of the column to sort
     * @param {string} order - Sort order, can be ASC or DESC
     */ 
    static sort(tableDefintion, rows,  columnIndex, order) {
        const column = tableDefintion.columns[columnIndex];
        if (! column) return;
        const iOrder = order === SortOrder.ASC ? 1 : -1;
        const isIterative = column.type == ColumnType.OBJS || column.type == ColumnType.TXTS || column.type == ColumnType.URLS;
        const property = column.type == ColumnType.URL ? 'label' : 'value';
        let index = 0;
        let value1, value2;
        rows.sort((row1, row2) => {
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
     * @param {Array<Row>} rows - List of rows
     * @param {string} searchInput - Search input
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
     * @param {Table} tableDefintion - Definition of the table
     * @param {Array<Row>} rows - List of rows
     * @param {string} title - Title of the exported table
     * @param {Function} badScoreLabelById - Function to get the label of a bad score
     * @returns {ExportedTable} Exported table
     */ 
    static export(tableDefintion, rows, title, badScoreLabelById) {

        /** @type {ExportedTable} */
        const exportedRows = { header: title, columns: [], rows: [] };

        // Parsing columns
        tableDefintion.columns.forEach((column) => {
            switch(column.type) {
                //---
                // In case we have a score column, then we want two things (instead of only one)
                // 1- The score
                // 2- The list of bad reason ids
                case ColumnType.SCR:  { 
                    exportedRows.columns.push(column.label, 'Reasons'); 
                    break; 
                }
                //---
                // In case we have a URL column (or a multiple URLs column), then we want two things (instead of only one)
                // 1- The label (used as the clickable text of the link)
                // 2- The URL (used as the target of the link)
                case ColumnType.URL:  
                case ColumnType.URLS: { 
                    exportedRows.columns.push(`${column.label} (label)`, `${column.label} (URL)`); 
                    break; 
                }
                //---
                // In case we have the dependency column, then we want to export only the list of items that are USED and REFENRECED
                case ColumnType.DEP: {
                    exportedRows.columns.push(`List of used`, `List of referenced`); 
                    break; 
                }
                //---
                // And for the rest, we only need one column
                default: { 
                    exportedRows.columns.push(column.label); 
                }
            }
        });

        // Parsing rows and cells
        rows.forEach((row) => {

            // Add the row in the first table
            /** @type {Array<string>} */
            const exportRow = [];
            row.cells?.forEach((cell) => {
                if (cell?.typeofindex === true) { // for INDEX typed cell, we set the row's index
                    exportRow.push(`${row?.index}`);
                } else if (cell?.typeofscore === true) { // for SCORE typed cell, we set the row's score and we add a JSON representation of the list of bad reason Ids
                    exportRow.push(`${row?.score}`, ARRAY_TO_STRING(row?.badReasonIds?.map((id) => badScoreLabelById(id))));
                } else if (cell?.typeofid === true) { // for URL typed cell, we set the label and then the URL
                    exportRow.push(`${cell?.data?.label}`, `${cell.data?.value}`);
                } else if (cell?.typeofids === true) { // for multiple URLs typed cell, we set a JSON representation of the labels and then a JSON representation of the URLs
                    exportRow.push(
                        ARRAY_TO_STRING(cell.data?.values?.map(v => `${v.data?.label}`)), 
                        ARRAY_TO_STRING(cell.data?.values?.map(v => `${v.data?.value}`))
                    );
                } else if (cell?.typeofdependencies === true) { // for DEPENDENCIES typed cell, we set a JSON representation of the USING and REFERENCED items
                    exportRow.push(
                        ARRAY_TO_STRING(cell.data?.value?.using?.map(v => `${v?.name} (${v?.type} - ${v?.id})`)),
                        ARRAY_TO_STRING(cell.data?.value?.referenced?.map(v => `${v?.name} (${v?.type} - ${v?.id})`))
                    );
                } else if (cell?.typeofobjects === true || cell?.typeoftexts === true) { 
                    // for multiple Objects typed cell, we previously used a template function to decorate the object into an array of strings
                    // for multiple Texts typed cell, we have already an array of strings
                    exportRow.push(ARRAY_TO_STRING(cell?.data?.values?.map(v => `${v.data}`)));
                } else { // for any other type use data?.value
                    exportRow.push(`${cell?.data?.value ?? ''}`);
                }
            });
            exportedRows.rows.push(exportRow);
        });

        return exportedRows;
    }

    /**
     * @description Export table
     * @param {Table} tableDefintion - Definition of the table
     * @param {Array<any>} records - List of records
     * @param {string} title - Title of the exported table
     * @param {Function} badScoreLabelById - Function to get the label of a bad score
     * @returns {ExportedTable} Exported table
     */ 
    static createAndExport(tableDefintion, records, title, badScoreLabelById) {
        const donothing = () => {};
        const rows = RowsFactory.create(tableDefintion, records, donothing, donothing);
        return RowsFactory.export(tableDefintion, rows, title, badScoreLabelById);
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

const ARRAY_TO_STRING = (array) => {
    return array ? JSON.stringify(array) : '';
};