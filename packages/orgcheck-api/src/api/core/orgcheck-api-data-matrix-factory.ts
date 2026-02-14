import { DataMatrix, DataMatrixRow } from "./orgcheck-api-data-matrix";

/**
 * @description This class represents a factory to create DataMatrixWorking objects.
 */ 
export class DataMatrixFactory {

    /**
     * @description Create a new instance of DataMatrixWorking
     * @returns {DataMatrixWorking} Returns a new instance of DataMatrixWorking that can be used to build a DataMatrix
     */
    static create(): DataMatrixWorking {
        return new DataMatrixWorking();
    }
}

/**
 * @description This class represents a matrix data beeing processed by the factory, once done you can turn this instance into a DataMatrix
 */
export class DataMatrixWorking {
    
    /**
     * @description Constructor
     * @public
     */
    constructor() {
        this._columnIds = new Set();
        this._columns = new Map();
        this._rows = new Map();
    }
    
    /**
     * @description Convert this working object into a data matrix object
     * @returns {DataMatrix} Returns a DataMatrix object containing the column headers and rows
     */
    toDataMatrix(): DataMatrix {
        /** @type {Array<any>} */
        const columnHeaders: Array<any> = [];
        this._columnIds.forEach((columnId) => {
            columnHeaders.push(this._columns.has(columnId) ? this._columns.get(columnId) : columnId);
        });
        return { 
            columnHeaders: columnHeaders,
            rows: Array.from(this._rows.values()) 
        };
    }

    /**
     * @description Add a value to the property of a specific row given its id
     * @param {string} rowId - the id of the row to which we want to add a value
     * @param {string} columnId - the id of the column to which we want to add a value
     * @param {string} value - the value to add to the property of the row
     * @public
     */
    addValueToProperty(rowId: string, columnId: string, value: string) {
        if (this._rows.has(rowId) === false) {
            this._rows.set(rowId, { header: {}, data: {}});
        }
        this._rows.get(rowId).data[columnId] = value;
        this._columnIds.add(columnId);
    }

    /**
     * @description Check if the header column has been already specified
     * @param {string} columnId - the id of the column to check
     * @returns {boolean} Returns true if the column header has been specified, false otherwise
     */
    hasColumnHeader(columnId: string): boolean {
        return this._columns.has(columnId);
    }
    
    /**
     * @description Set the header column
     * @param {string} columnId - the id of the column to set
     * @param {any} columnRef - the reference to the column header, can be a string or any other type
     */
    setColumnHeader(columnId: string, columnRef: any) {
        this._columns.set(columnId, columnRef);
    }
   
    /**
     * @description Check if the header row has been already specified
     * @param {string} rowId - the id of the row to check
     * @returns {boolean} Returns true if the row header has been specified, false otherwise
     */
    hasRowHeader(rowId: string): boolean {
        return this._rows.has(rowId) && this._rows.get(rowId).header;
    }
    
    /**
     * @description Set the header row
     * @param {string} rowId - the id of the row to set
     * @param {any} rowRef - the reference to the row header, can be a string or any other type
     */
    setRowHeader(rowId: string, rowRef: any) {
        if (this._rows.has(rowId) === true) {
            this._rows.get(rowId).header = rowRef; 
        } else {
            this._rows.set(rowId, { header: rowRef, data: {}});
        }
    }
   
    /**
     * @type {Set<string>}
     * @private
     */
    _columnIds: Set<string>;

    /**
     * @type {Map<string, any>}}
     * @private
     */
    _columns: Map<string, any>;

    /**
     * @type {Map<string, DataMatrixRow>}
     * @private
     */
    _rows: Map<string, DataMatrixRow>;
}