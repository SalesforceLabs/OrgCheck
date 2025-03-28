import { DataMatrix, DataMatrixRow } from "./orgcheck-api-data-matrix";

/**
 * @description This class represents a factory to create DataMatrixWorking objects.
 */ 
export class DataMatrixFactory {

    /**
     * @description Create a new instance of DataMatrixWorking
     * @returns {DataMatrixWorking}
     */
    static create() {
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
     * @returns {DataMatrix}
     */
    toDataMatrix() {
        const columnHeaders = [];
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
     * @param {string} rowId 
     * @param {string} columnId 
     * @param {string} value 
     * @public
     */
    addValueToProperty(rowId, columnId, value) {
        if (this._rows.has(rowId) === false) {
            this._rows.set(rowId, { header: {}, data: {}});
        }
        this._rows.get(rowId).data[columnId] = value;
        this._columnIds.add(columnId);
    }

    /**
     * @description Check if the header column has been already specified
     * @param {string} columnId
     * @returns {boolean}
     */
    hasColumnHeader(columnId) {
        return this._columns.has(columnId);
    }
    
    /**
     * @description Set the header column
     * @param {string} columnId
     * @param {any} columnRef
     */
    setColumnHeader(columnId, columnRef) {
        this._columns.set(columnId, columnRef);
    }
   
    /**
     * @description Check if the header row has been already specified
     * @param {string} rowId
     * @returns {boolean}
     */
    hasRowHeader(rowId) {
        return this._rows.has(rowId) && this._rows.get(rowId).header;
    }
    
    /**
     * @description Set the header row
     * @param {string} rowId
     * @param {any} rowRef
     */
    setRowHeader(rowId, rowRef) {
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
    _columnIds;

    /**
     * @type {Map<string, any>}}
     * @private
     */
    _columns;

    /**
     * @type {Map<string, DataMatrixRow>}
     * @private
     */
    _rows;
}