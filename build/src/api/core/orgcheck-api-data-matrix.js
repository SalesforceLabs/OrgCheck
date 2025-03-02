/**
 * @description This class represents a matrix data
 * @example Example of a DataMatrix would be:
 *               {
 *                  columnHeaders: [
 *                      { id: 'objectA', label: 'Object A', url: '...' }},
 *                      { id: 'objectB', label: 'Object B', url: '...' }},
 *                      { id: 'objectC', label: 'Object C', url: '...' }},
 *                      { id: 'objectD', label: 'Object D', url: '...' }}
 *                  ],
 *                  rows: [
 *                     { header: { label: 'Profile 1',        url: '...' }, data: { objectA: 'CR', objectB: 'CRU',                   objectD: 'R'     } },
 *                     { header: { label: 'Permission Set A', url: '...' }, data: { objectA: 'CR',                                   objectD: 'R'     } },
 *                     { header: { label: 'Permission Set B', url: '...' }, data: {                                objectC: 'CRUDm', objectD: 'CRUDm' } },
 *                  ]
 *               }
 */
export class DataMatrix {

    /**
     * @description Information about the columns that could be found in the rows.data structure. Keys are the name fo the properties. Values are the information for this property.
     * @type {Array<any>}
     * @public
     */
    columnHeaders;

    /** 
     * @description List of data for each "row". A row will have a headerId (used as row header in the matrix view). And data is an object with as many properties.
     * @type {Array<DataMatrixRow>}
     * @public
     */
    rows;
}

/**
 * @description This class represents a column header in a matrix data.
 */ 
export class DataMatrixColumnHeader {
    
    /**
     * @description Key to be used as a property of rows.data
     * @type {string}
     * @public
     */
    id;
    
    /** 
     * @description If specify this describe the columns better than just an id
     * @type {any}
     * @public
     */
    ref;
}

/**
 * @description This class represents a row in a matrix data.
 */ 
export class DataMatrixRow {
    
    /**
     * @description Header reference of the matrix row
     * @type {any}
     * @public
     */
    header;
    
    /** 
     * @description Data of the row as an object with dynamic properties (defined in the parent DataMatrix object).
     * @type {any}
     * @public
     * @see DataMatrix
     */
    data;
}