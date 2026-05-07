import { CellFactory } from 'src/ui/table/row/orgcheck-ui-table-cellfactory';
import { Row } from 'src/ui/table/row/orgcheck-ui-table-row';
import { TableColumn } from 'src/ui/table/column/orgcheck-ui-table-column';
import { TableDefinition } from '../orgcheck-ui-table-definition';

export class RowsFactory {

    /**
     * @description Create the rows of a table
     * @param {TableDefinition} tableDefinition - Definition of the table
     * @param {Record<string, unknown>[]} records - List of records
     * @param {Function} onEachRowCallback - Callback to be called for each row
     * @param {Function} onEachCellCallback - Callback to be called for each cell
     * @returns {Row[]} List of rows
     */
    static create(tableDefinition: TableDefinition, records: unknown[], onEachRowCallback: (record: unknown, isBad: boolean, index: number) => void, onEachCellCallback: (record: unknown, isBad: boolean, rowIndex: number, cellIndex: number) => void): Row[] {
        return (records as Record<string, unknown>[])?.map((record, rIndex) => {
            const row = {
                index: rIndex+1, // 1-based index of the current row (should be recalculated after sorting)
                score: record['score'] as number, // score is a global KPI at the row level (not at a cell i mean)
                name : (record['name'] ?? record['label']) as string, // try to get the "name" of that record
                badFields: record['badFields'] as string[], // needed to see the score explanation in a modal
                badReasonIds: record['badReasonIds'] as string[], // needed to see the score explanation in a modal
                cells: tableDefinition.columns.map((column: TableColumn, cIndex: number) => {
                    const cell = CellFactory.create(column, record);
                    // Potentially alter the cell
                    const badFields = record['badFields'] as string[] | undefined;
                    const colData = column['data'] as unknown as Record<string, string> | undefined;
                    onEachCellCallback(
                        cell, 
                        (colData && badFields) ? ( badFields.includes(colData['value']) || badFields.includes(colData['values'])) : false,
                        rIndex,
                        cIndex
                    );
                    // Finally return the cell
                    return cell;
                }),
                isVisible: true
            }
            // Potentially alter the row
            if (onEachRowCallback) onEachRowCallback(row, (record['score'] as number) > 0, rIndex);
            // Finally return the row
            return row;
        }) ?? [];
    }
}
