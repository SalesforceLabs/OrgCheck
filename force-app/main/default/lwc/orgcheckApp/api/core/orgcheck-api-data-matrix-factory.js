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
     * @param {Map<string, any>} rowHeaderReferences 
     * @returns {OrgCheckDataMatrix}
     */
    toDataMatrix(rowHeaderReferences) {
        return { 
            columnHeaderIds: Array.from(this._properties), 
            rowHeaderReferences: rowHeaderReferences,
            rows: Array.from(this._rows.values()) 
        };
    }

    /**
     * @description Add a value to the property of a specific row given its id
     * @param {string} rowId 
     * @param {string} property 
     * @param {string} value 
     * @public
     */
    addValueToProperty(rowId, property, value) {
        if (this._rows.has(rowId) === false) {
            this._rows.set(rowId, { headerId: rowId, data: {}});
        }
        this._rows.get(rowId).data[property] = value;
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