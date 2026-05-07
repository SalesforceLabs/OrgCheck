import { TableColumn } from 'src/ui/table/column/orgcheck-ui-table-column';
import { ColumnType } from 'src/ui/table/column/orgcheck-ui-table-columntype';
import { Modifier } from 'src/ui/table/column/orgcheck-ui-table-modifier';

export class CellFactory {

    /**
     * @description Create a cell based on the column definition and the input row
     * @param {TableColumn } column - Column header information
     * @param {Record<string, unknown>} row - Input data
     * @returns {Record<string, unknown>} Output data
     * @static
     */
    static create(column: TableColumn, row: Record<string, unknown>): Record<string, unknown> {
        const cell: { data: Record<string, unknown>; [key: string]: unknown } = { data: {}};
        const modifier = column['modifier'] ?? undefined;
        const columnData = column['data'] ?? {};
        switch (column.type) {
            case ColumnType.TXTS: {
                cell.data['values'] = MAP(RESOLVE(row, (columnData as Record<string, string>)['values']), (item: unknown) => DECORATE({ data: item }, modifier as Modifier | undefined));
                break;
            }
            case ColumnType.OBJS: {
                const template = (columnData as Record<string, unknown>)['template'] ?? (() => '');
                cell.data['values'] = MAP(RESOLVE(row, (columnData as Record<string, string>)['values']), (item: unknown) => DECORATE({ data: (template as (arg: unknown) => unknown)(item) }, modifier as Modifier | undefined));
                break;
            }
            case ColumnType.URLS: {
                cell.data['values'] = MAP(RESOLVE(row, (columnData as Record<string, string>)['values']), (item: unknown) => {
                    const value: { data: Record<string, unknown>; [key: string]: unknown } = { data: {}};
                    Object.keys(columnData as Record<string, string>).filter((p) => p !== 'values').forEach((property) => {
                        value.data[property] = RESOLVE(item as Record<string, unknown>, (columnData as Record<string, string>)[property]);
                    });
                    return DECORATE(value, modifier as Modifier | undefined);
                });
                break;
            }
            default: {
                Object.keys(columnData as Record<string, string>).forEach((property) => {
                    cell.data[property] = RESOLVE(row, (columnData as Record<string, string>)[property]);
                });
                DECORATE(cell, modifier as Modifier | undefined);
            }
        }
        cell[`typeof${column.type}`] = true;
        if ((row?.['badFields'] as string[] | undefined)?.includes((columnData as Record<string, string>)['values'] ?? (columnData as Record<string, string>)['value']) ?? false) {
            cell['isbad'] = true;
        }
        return cell;
    }
}

/**
 * @description Get the value of the given property (could include nested properties using the dot sign) in the given row.
 * @param {Record<string, unknown>} row - Input row
 * @param {string} property - Name of the property to look for.
 * @returns {unknown} Value of the given property in the given row
 */
const RESOLVE = (row: Record<string, unknown>, property: string): unknown => {
    let reference: unknown = row;
    property?.split('.').forEach((p: string) => { if (reference) reference = (reference as Record<string, unknown>)[p]; });
    return reference;
}

const MAP = (array: unknown, callback: (item: unknown) => unknown): unknown[] => {
    if (Array.isArray(array)) {
        return array.map((item) => callback(item));
    }
    return array as unknown[];
}

/**
 * @description Decorate the cell based on modifiers and potentially add a decoration property to the given cell
 * @param {{ data: Record<string, unknown>; [key: string]: unknown }} cell - Cell information
 * @param {Modifier | undefined} modifier - Modifier information
 * @returns {{ data: Record<string, unknown>; [key: string]: unknown }} the cell with a potential decoration property
 */
const DECORATE = (cell: { data: Record<string, unknown> | unknown; [key: string]: unknown }, modifier: Modifier | undefined): { data: Record<string, unknown> | unknown; [key: string]: unknown } => {
    if (modifier) {
        const data = (typeof cell.data === 'object' && cell.data !== null && 'value' in (cell.data as Record<string, unknown>)) ? (cell.data as Record<string, unknown>)['value'] : cell.data;
        if (modifier.maximumLength !== undefined) {
            if (data && typeof data === 'string' && data.length > modifier.maximumLength) {
                cell['decoration'] = data.substring(0, modifier.maximumLength);
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
                cell['decoration'] =  modifier.valueIfEmpty;
            }
        }
        if (modifier.preformatted === true) {
            cell['isPreformatted'] = true;
        }
        if (modifier.minimum !== undefined && modifier.valueBeforeMin !== undefined) {
            if (data !== undefined && typeof data === 'number' && data < modifier.minimum) {
                cell['decoration'] = modifier.valueBeforeMin;
            }
        }
        if (modifier.maximum !== undefined && modifier.valueAfterMax !== undefined) {
            if (data !== undefined && typeof data === 'number' && data > modifier.maximum) {
                cell['decoration'] = modifier.valueAfterMax;
            }
        }
    }
    return cell;
}
