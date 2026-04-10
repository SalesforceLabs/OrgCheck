import { TableColumn } from 'src/ui/table/column/orgcheck-ui-table-column';
import { ColumnType } from 'src/ui/table/column/orgcheck-ui-table-columntype';

export class CellFactory {

    /**
     * @description Create a cell based on the column definition and the input row
     * @param {TableColumn } column - Column header information
     * @param {any} row - Input data
     * @returns {any} Output data
     * @static
     */
    static create(column: TableColumn, row: any): any {
        const cell: { data: any } = { data: {}};
        const modifier = column['modifier'] ?? undefined;
        const columnData = column['data'] ?? {};
        switch (column.type) {
            case ColumnType.TXTS: {
                cell.data.values = MAP(RESOLVE(row, columnData['values']), (item: any) => DECORATE({ data: item }, modifier));
                break;
            }
            case ColumnType.OBJS: {
                const template = columnData['template'] ?? (() => '');
                cell.data.values = MAP(RESOLVE(row, columnData['values']), (item: any) => DECORATE({ data: template(item) }, modifier));
                break;
            }
            case ColumnType.URLS: {
                cell.data.values = MAP(RESOLVE(row, columnData['values']), (item: any) => {
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
 * @param {any} row - Input row
 * @param {string} property - Name of the property to look for.
 * @returns {any} Value of the given property in the given row
 */
const RESOLVE = (row: any, property: string): any => {
    let reference = row;
    property?.split('.').forEach((p: string) => { if (reference) reference = reference[p]; });
    return reference;
}

const MAP = (array: any[], callback: Function): any[] => {
    if (Array.isArray(array)) {
        return array.map((item) => callback(item));
    }
    return array;
}

/**
 * @description Decorate the cell based on modifiers and potentially add a decoration property to the given cell
 * @param {any} cell - Cell information
 * @param {any} modifier - Modifier information
 * @returns {any} the cell with a potential decoration property
 */
const DECORATE = (cell: any, modifier: any): any => {
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
}