/**
 * @description This class represents a matrix data with a list of properties (as an Array of string) and a list of object that store 
 *   the data in rows.
 */
export class OrgCheckDataMatrix {

    /**
     * @description List of properties on the row's data object. Each property is used as column header in the matrix view.
     * @type {Array<string>}
     * @public
     */
    properties;

    /** 
     * @description List of data for each "row". A row will have a name (used as row header in the matrix view). And data is an object with as many properties.
     * @type {Array<OrgCheckDataMatrixRow>}
     * @public
     */
    rows;
}

/**
 * @description This class represents a row in a matrix data.
 */ 
export class OrgCheckDataMatrixRow {
    
    /**
     * @description Name of the matrix row
     * @type {string}
     * @public
     */
    name;
    
    /** 
     * @description Data of the row as an object with dynamic properties (defined in the parent OrgCheckDataMatrix object).
     * @type {any}
     * @public
     * @see OrgCheckDataMatrix
     */
    data;
}