import { OrgCheckDataMatrix, OrgCheckDataMatrixRow } from "./orgcheck-api-data-matrix";

/**
 * @description This class represents a factory to create OrgCheckDataMatrixWorking objects.
 */ 
export class OrgCheckDataMatrixFactory {

    /**
     * @description Create a new instance of OrgCheckDataMatrixWorking
     * @returns {OrgCheckDataMatrixWorking}
     */
    static create() {
        return new OrgCheckDataMatrixWorking();
    }
}

/**
 * @description This class represents a matrix data beeing processed by the factory, once done you can turn this instance into a DataMatrix
 */
export class OrgCheckDataMatrixWorking {
    
    /**
     * @description Constructor
     * @public
     */
    constructor() {
        this._properties = new Set();
        this._rows = new Map();
    }
    
    /**
     * @description Convert this working object into a data matrix object
     * @returns {OrgCheckDataMatrix}
     */
    toDataMatrix() {
        return { 
            properties: Array.from(this._properties), 
            rows: Array.from(this._rows.values()) 
        };
    }

    /**
     * @description Add a value to the property of a specific row given its id (and later on visible given its name)
     * @param {string} rowId 
     * @param {string} rowName 
     * @param {string} property 
     * @param {string} value 
     * @public
     */
    addValueToProperty(rowId, rowName, property, value) {
        if (this._rows.has(rowId) === false) {
            this._rows.set(rowId, { name: rowName, data: {}});
        }
        this._rows.get(rowName).data[property] = value;
        this._properties.add(property);
    }

    /**
     * @type {Set}
     * @private
     */
    _properties;

    /**
     * @type {Map<string, OrgCheckDataMatrixRow>}
     * @private
     */
    _rows;
}