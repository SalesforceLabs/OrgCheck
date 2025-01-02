/**
 * @description This class represents a matrix data with a list of properties (as an Array of string) and a list of object that store 
 *   the data in rows.
 */
export class OrgCheckDataMatrix {

    /**
     * @description List of column header ids which correspond to properties in data rows (can be salesforce id and you will map it with labels in the UI).
     * @type {Array<string>}
     * @public
     */
    columnHeaderIds;

    /**
     * @description List of row header references identified by its id
     * @type {Map<string, any>}
     * @public
     */
    rowHeaderReferences;

    /**
     * @description List of column header references identified by its id
     * @type {Map<string, any>}
     * @public
     */
    columnHeaderReferences;

    /** 
     * @description List of data for each "row". A row will have a headerId (used as row header in the matrix view). And data is an object with as many properties.
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
     * @description Header id of the matrix row
     * @type {string}
     * @public
     */
    headerId;
    
    /** 
     * @description Data of the row as an object with dynamic properties (defined in the parent OrgCheckDataMatrix object).
     * @type {any}
     * @public
     * @see OrgCheckDataMatrix
     */
    data;
}