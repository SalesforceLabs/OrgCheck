import { CellFactory } from 'src/ui/table/row/orgcheck-ui-table-cellfactory';
import { Row } from 'src/ui/table/row/orgcheck-ui-table-row';
import { TableDefinition } from '../orgcheck-ui-table-definition';

export class RowsFactory {

    /**
     * @description Create the rows of a table
     * @param {TableDefinition} tableDefinition - Definition of the table
     * @param {any[]} records - List of records
     * @param {Function} onEachRowCallback - Callback to be called for each row
     * @param {Function} onEachCellCallback - Callback to be called for each cell
     * @returns {Row[]} List of rows
     */
    static create(tableDefinition: TableDefinition, records: any[], onEachRowCallback: Function, onEachCellCallback: Function): Row[] {
        return records?.map((record, rIndex) => {
            const row = {
                index: rIndex+1, // 1-based index of the current row (should be recalculated after sorting)
                score: record.score, // score is a global KPI at the row level (not at a cell i mean)
                name : record.name ?? record.label, // try to get the "name" of that record
                badFields: record.badFields, // needed to see the score explaination in a modal
                badReasonIds: record.badReasonIds, // needed to see the score explaination in a modal
                cells: tableDefinition.columns.map((column: any, cIndex: number) => {
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
        }) ?? [];
    }
}