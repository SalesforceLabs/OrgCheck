import { ColumnType, TableColumn, TableColumnWithData, TableColumnWithModifiers } from "./orgcheck-ui-table-column";

export class CellFactory {

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
}

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
                (data && typeof data === 'string' && data.trim().length === 0) ||
                // Empty array 
                (data && Array.isArray(data) && data.length === 0)
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