import { ExportedTable, Table } from "src/ui/table/orgcheck-ui-table";
import { ColumnType } from "src/ui/table/column/orgcheck-ui-table-columntype";
import { SortOrder } from "src/ui/table/orgcheck-ui-table-sortorder";
import { TableDefinition } from "src/ui/table/orgcheck-ui-table-definition";
import { RowsFactory } from "src/ui/table/row/orgcheck-ui-table-rowsfactory";
import { SecretSauce } from "src/api/core/orgcheck-api-secretsauce";

export class TableFactory {

    /**
     * @description Creates a new table instance
     * @param {string} title - The title of the table
     * @param {TableDefinition} tableDefinition - The definition of the table
     * @param {any[]} records - The list of records to display in the table
     * @returns {Table} The created table instance
     * @static
     * @public
     */
    public static create(title: string, tableDefinition: TableDefinition, records: any[]): Table {
        let nbBadRows = 0;
        const rows = RowsFactory.create(
            tableDefinition, 
            records, 
            (_row: any[], isRowBad: boolean) => { if (isRowBad) nbBadRows++ }, 
            () => {}
        );
        return {
            name: title,
            definition: tableDefinition,
            orderIndex: tableDefinition.orderIndex,
            orderSort: tableDefinition.orderSort,
            rows: rows ?? [],
            nbAllRows: rows?.length ?? 0,
            nbFilteredRows: 0,
            nbBadRows: nbBadRows,
            isFilterOn: false,
            isFilteredDataEmpty: false
        };
    }

    /**
     * @description Sorts the table by the specified column and order
     * @param {Table} table - The table to export
     * @param {number} columnIndex - The index of the column to sort by
     * @param {SortOrder} order - The sort order (ASC or DESC)
     * @static
     * @public
     */
    public static sort(table: Table, columnIndex: number, order: SortOrder): void {
        const column = table.definition.columns[columnIndex];
        if (! column) return;
        const iOrder = order === SortOrder.ASC ? 1 : -1;
        const isIterative = column.type == ColumnType.OBJS || column.type == ColumnType.TXTS || column.type == ColumnType.URLS;
        const property = column.type == ColumnType.URL ? 'label' : 'value';
        let index = 0;
        let value1: any, value2: any;
        table.rows.sort((row1, row2) => {
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
     * @description Filters the table by the specified string
     * @param {Table} table - The table to export
     * @param {string} searchInput - The string to filter by
     * @static
     * @public
     */
    public static filter(table: Table, searchInput: string): void {
        if (searchInput?.length > 2) {
            const s = searchInput.toUpperCase();
            let index = 0;                   
            table.rows.forEach((row) => {
                if (ARRAY_MATCHER(row.cells, s) === true) {
                    row.isVisible = true;
                    row.index = ++index;
                } else {
                    row.isVisible = false;
                }
            });
        } else {
            table.rows.forEach((row, index) => { 
                row.isVisible = true;
                row.index = index+1;
            });
        }
    }

    /**
     * @description Exports the table data
     * @param {Table} table - The table to export
     * @returns {ExportedTable} The exported table data
     * @static
     * @public
     */
    public static export(table: Table): ExportedTable {
        const exportedRows: ExportedTable = { label: table.name, columns: [], rows: [] };

        // Parsing columns
        table.definition.columns.forEach((column) => {
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
        table.rows.forEach((row) => {
            // Add the row in the first table
            const exportRow: Array<string> = [];
            row.cells?.forEach((cell) => {
                if (cell?.typeofindex === true) { // for INDEX typed cell, we set the row's index
                    exportRow.push(`${row?.index}`);
                } else if (cell?.typeofscore === true) { // for SCORE typed cell, we set the row's score and we add a JSON representation of the rule descriptions
                    exportRow.push(`${row?.score}`, ARRAY_TO_STRING(row?.badReasonIds?.map((id) => SecretSauce.GetScoreRuleDescription(Number.parseInt(id)))));
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
}


const STRING_MATCHER = (value: any, searchingValue: string) => {
    return `${value}`.toUpperCase().indexOf(searchingValue) >= 0;
}

const ARRAY_MATCHER = (array: any[], s: string) => {
    return array.findIndex((item) => {
        return Object.values(item.data).findIndex((property) => {
            if (Array.isArray(property)) {
                return ARRAY_MATCHER(property, s);
            }
            return STRING_MATCHER(property, s);
        }) >= 0;
    }) >= 0
}

const ARRAY_TO_STRING = (array: any[] | undefined) => {
    return array ? JSON.stringify(array) : '';
};
