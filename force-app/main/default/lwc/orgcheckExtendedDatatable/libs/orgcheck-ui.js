class WhereToGetData {

    /**
     * @description Property containing the value
     * @type {string}
     */
    value;
}

class WhereToGetScoreData {

    /**
     * @description Property containing the score
     * @type {string}
     */
    value;

    /**
     * @description Property containing the Salesforce ID of the entity that has this score
     * @type {string}
     */
    id;

    /**
     * @description Property containing the name/label of the entity that has this score
     * @type {string}
     */
    name;
}

class WhereToGetLinkData {

    /**
     * @description Property containing the url to be used in the link
     * @type {string}
     */
    value;

    /**
     * @description Property containing the label to be used in the link
     * @type {string}
     */
    label;
}

class WhereToGetLinksData extends WhereToGetLinkData {

    /**
     * @description Property containing the list to iterate over
     * @type {string}
     */
    values;
}

class WhereToGetObjectsData {

    /**
     * @description Property containing the list to iterate over
     * @type {string}
     */
    values;

    /**
     * @description Template function to generate a text based on the object
     * @type {function(any): string}
     */
    template;
}

class WhereToGetTextsData {

    /**
     * @description Property containing the list to iterate over
     * @type {string}
     */
    values;
}

class TextTruncatedModifier {

    /**
     * @description If text value has more than this maximum length of characters, the string will be truncated accordingly.
     * @type {number}
     */
    maximumLength;

    /**
     * @description If value is empty (undefined, empty string, numerical zero, empty list, etc...), this is the substitute text to use
     * @type {string}
     */
    valueIfEmpty;
}

class PreformattedModifier {

    /**
     * @description If text value will be rendered as preformatted (like code or formulas etc.)
     * @type {boolean}
     */
    preformatted;

    /**
     * @description If text value has more than this maximum length of characters, the string will be truncated accordingly.
     * @type {number}
     */
    maximumLength;
}

class EmptyModifier {

    /**
     * @description If value is empty (undefined, empty string, numerical zero, empty list, etc...), this is the substitute text to use
     * @type {string}
     */
    valueIfEmpty;
}

class NumericMinimumModifier {

    /**
     * @description If the value is less that this value, the text will be substituted.
     * @type {number}
     */
    minimum;

    /**
     * @description If value is less than 'min', this is the substitute text to use
     * @type {string}
     */
    valueBeforeMin;

    /**
     * @description If value is undefined (not zero), this is the substitute text to use
     * @type {string}
     */
    valueIfEmpty;
}

class NumericMaximumModifier {

    /**
     * @description If the value is greater that this value, the text will be substituted.
     * @type {number}
     */
    maximum;

    /**
     * @description If value is greater than 'max', this is the substitute text to use
     * @type {string}
     */
    valueAfterMax;
}

class NumericMinMaxModifier {

    /**
     * @description If the value is less that this value, the text will be substituted.
     * @type {number}
     */
    minimum;

    /**
     * @description If value is less than 'min', this is the substitute text to use
     * @type {string}
     */
    valueBeforeMin;

    /**
     * @description If the value is greater that this value, the text will be substituted.
     * @type {number}
     */
    maximum;

    /**
     * @description If value is greater than 'max', this is the substitute text to use
     * @type {string}
     */
    valueAfterMax;
}

const Orientation = {
    HORIZONTAL: 'horizontal',
    VERTICAL: 'vertical'
};

const ColumnType = {
    IDX:  'index',
    SCR:  'score',
    TXT:  'text',
    TXTS: 'texts',
    NUM:  'numeric',
    PRC:  'percentage',
    URL:  'id',
    URLS: 'ids',
    CHK:  'boolean',
    DTM:  'datetime',
    DEP:  'dependencies',
    OBJS: 'objects'
};

class TableColumn {

    /** 
     * @description Label used in the header of the column
     * @type {string}
     */ 
    label;

    /** 
     * @description Type used in the header of the column
     * @see ColumnType
     * @type {string}
     */ 
    type;
}

class TableColumnWithData {

    /** 
     * @description Label used in the header of the column
     * @type {string}
     */ 
    label;

    /** 
     * @description Type used in the header of the column
     * @see ColumnType
     * @type {string}
     */ 
    type;

    /**
     * @description Defines how to retrieve the data -- in which property
     * @type {WhereToGetData | WhereToGetScoreData | WhereToGetLinkData | WhereToGetLinksData | WhereToGetObjectsData | WhereToGetTextsData}
     */
    data;
}

class TableColumnWithModifiers extends TableColumn {

    /** 
     * @description 
     * @type {TextTruncatedModifier | PreformattedModifier | EmptyModifier | NumericMinimumModifier | NumericMaximumModifier | NumericMinMaxModifier}
     */
    modifier;
}

class TableColumnWithOrientation extends TableColumn {

    /** 
     * @description In which orientation the column should be.
     * @see Orientation
     * @type {string}
     */
    orientation;
}

class CellFactory {

    /**
     * @description Create an instance of WhereToGetData like objects from a type and a set of properties
     * @param {TableColumn | TableColumnWithData | TableColumnWithModifiers} column 
     * @param {any} row
     * @returns {any}
     * @static
     */
    static create(column, row) {
        const cell = { data: {}};
        const modifier = column['modifier'] ?? undefined;
        const columnData = column['data'] ?? {};
        switch (column.type) {
            case ColumnType.TXTS: {
                cell.data.values = RESOLVE(row, columnData['values'])?.map((item) => DECORATE({ data: item }, modifier));
                break;
            }
            case ColumnType.OBJS: {
                const template = columnData['template'] ?? (() => '');
                cell.data.values = RESOLVE(row, columnData['values'])?.map((item) => DECORATE({ data: template(item) }, modifier));
                break;
            }
            case ColumnType.URLS: {
                cell.data.values = RESOLVE(row, columnData['values'])?.map((item) => {
                    const value = { data: {}};
                    Object.keys(columnData).filter((p) => p !== 'values').forEach((property) => {
                        value.data[property] = RESOLVE(item, columnData[property]);
                    });
                    return DECORATE(value, modifier);
                });
                break;
            }
            default: {
                Object.keys(columnData).forEach((property) => {
                    cell.data[property] = RESOLVE(row, columnData[property]);
                });
                DECORATE(cell, modifier);
            }
        }
        cell[`typeof${column.type}`] = true;
        return cell;
    }
}

/**
 * @description Get the value of the given property (could include neasted properties using the dot sign) in the given row.
 * @param {any} row 
 * @param {string} property 
 * @returns any
 */
const RESOLVE = (row, property) => {
    let reference = row;
    property.split('.').forEach((/** @type string} */ p) => { if (reference) reference = reference[p]; });
    return reference;
};

/**
 * @description Decorate the cell based on modifiers and potentially add a decoration property to the given cell
 * @param {any} cell 
 * @param {any} modifier 
 * @returns the cell with a potential decoration property
 */
const DECORATE = (cell, modifier) => {
    if (modifier) {
        const data = ('value' in cell.data) ? cell.data.value : cell.data; // 'in syntax' used --> if cell.data.value === undefined!!!
        if (modifier.maximumLength !== undefined) {
            if (data && typeof data === 'string' && data.length > modifier.maximumLength) {
                cell.decoration = data.substring(0, modifier.maximumLength);
            }
        }
        if (modifier.valueIfEmpty !== undefined) {
            if (
                // Undefined (whatever the type)
                data === undefined || 
                // Null (whatever the type)
                data === null || 
                // Empty string
                (typeof data === 'string' && data.trim().length === 0) ||
                // Empty array 
                (Array.isArray(data) && data.length === 0)
            ) {
                cell.decoration =  modifier.valueIfEmpty;
            }
        }
        if (modifier.preformatted === true) {
            cell.isPreformatted = true;
        }
        if (modifier.minimum !== undefined && modifier.valueBeforeMin !== undefined) {
            if (data !== undefined && typeof data === 'number' && data < modifier.minimum) {
                cell.decoration = modifier.valueBeforeMin;
            }
        }
        if (modifier.maximum !== undefined && modifier.valueAfterMax !== undefined) {
            if (data !== undefined && typeof data === 'number' && data > modifier.maximum) {
                cell.decoration = modifier.valueAfterMax;
            }
        }
    }
    return cell;
};

const SortOrder = {
    DESC: 'desc',
    ASC: 'asc'
};

class Table {

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

class ExportedTable {

    /**
     * @description Name of the exported table (like a title)
     * @type {string}
     */
    header;

    /**
     * @description List of column labels
     * @type {Array<string>}
     */
    columns;

    /**
     * @description List of rows with cells
     * @type {Array<Array<string>>}
     */
    rows;
}

class Row {

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

class RowsFactory {

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
            };
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
        const column = tableDefintion.columns[columnIndex];
        if (! column) return;
        const iOrder = order === SortOrder.ASC ? 1 : -1;
        const isIterative = column.type == ColumnType.OBJS || column.type == ColumnType.TXTS || column.type == ColumnType.URLS;
        const property = column.type == ColumnType.URL ? 'label' : 'value';
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
     * @param {Function} badScoreLabelById
     * @returns {Array<ExportedTable>}
     */ 
    static export(tableDefintion, rows, title, badScoreLabelById) {

        /** @type {ExportedTable} */
        const exportedRows = { header: title, columns: [], rows: [] };

        /** @type {ExportedTable} */
        const exportedReasons = { header: `⚠️ ${title}`, columns: [ '(#) Item', '(Id) Reason' ], rows: [] };

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
                // And for the rest, we only need one column
                default: { 
                    exportedRows.columns.push(column.label); 
                }
            }
        });

        // Parsing rows and cells
        rows.forEach((row) => {

            // Add the bad reasons in the second table for this row
            row.badReasonIds?.forEach((id) => {
                exportedReasons.rows.push([`(${row.index}) ${row.name}`, `(${id}) ${badScoreLabelById(id)}`]);
            });

            // Add the row in the first table
            const exportRow = [];
            row.cells?.forEach((cell) => {
                if (cell.typeofindex === true) { // for INDEX typed cell, we set the row's index
                    exportRow.push(row.index);
                } else if (cell.typeofscore === true) { // for SCORE typed cell, we set the row's score and we add a JSON representation of the list of bad reason Ids
                    exportRow.push(row.score, ARRAY_TO_STRING(row.badReasonIds?.map((id) => id)));
                } else if (cell.typeofid === true) { // for URL typed cell, we set the label and then the URL
                    exportRow.push(cell.data.label, cell.data.value);
                } else if (cell.typeofids === true) { // for multiple URLs typed cell, we set a JSON representation of the labels and then a JSON representation of the URLs
                    exportRow.push(
                        ARRAY_TO_STRING(cell.data.values?.map(v => v.data.label)), 
                        ARRAY_TO_STRING(cell.data.values?.map(v => v.data.value))
                    );
                } else if (cell.typeofobjects === true || cell.typeofobjects === true) { 
                    // for multiple Objects typed cell, we previously used a template function to decorate the object into an array of strings
                    // for multiple Texts typed cell, we have already an array of strings
                    exportRow.push(ARRAY_TO_STRING(cell.data.values?.map(v => v.data)));
                } else { // for any other type use data.value
                    exportRow.push(cell.data.value ?? '');
                }
            });
            exportedRows.rows.push(exportRow);
        });

        // return the two sheets
        if (exportedReasons.rows.length === 0) {
            // There is no reasong why any of the records are bad here, so better not include that empty sheet in the export!
            return [ exportedRows ];
        }
        // If there is at least one reason why we have bad rows, let's return this next to the rows
        return [ exportedRows, exportedReasons ];
    }

    /**
     * @description Export table
     * @param {Table} tableDefintion
     * @param {Array<any>} records
     * @param {string} title 
     * @param {Function} badScoreLabelById
     * @returns {Array<ExportedTable>}
     */ 
    static createAndExport(tableDefintion, records, title, badScoreLabelById) {
        const donothing = () => {};
        const rows = RowsFactory.create(tableDefintion, records, donothing, donothing);
        return RowsFactory.export(tableDefintion, rows, title, badScoreLabelById);
    }
}

const STRING_MATCHER = (value, searchingValue) => {
    return String(value).toUpperCase().indexOf(searchingValue) >= 0;
};

const ARRAY_MATCHER = (array, s) => {
    return array.findIndex((item) => {
        return Object.values(item.data).findIndex((property) => {
            if (Array.isArray(property)) {
                return ARRAY_MATCHER(property, s);
            }
            return STRING_MATCHER(property, s);
        }) >= 0;
    }) >= 0
};

const ARRAY_TO_STRING = (array) => {
    return JSON.stringify(array);
};

export { CellFactory, ColumnType, EmptyModifier, ExportedTable, NumericMaximumModifier, NumericMinMaxModifier, NumericMinimumModifier, Orientation, PreformattedModifier, Row, RowsFactory, SortOrder, Table, TableColumn, TableColumnWithData, TableColumnWithModifiers, TableColumnWithOrientation, TextTruncatedModifier, WhereToGetData, WhereToGetLinkData, WhereToGetLinksData, WhereToGetObjectsData, WhereToGetScoreData, WhereToGetTextsData };
