// @ts-check

/**
 * @description This class represents a matrix data with a list of properties (as an Array of string) and a list of object that store 
 *   the data in rows.
 */
export class OrgCheckMatrixData {
    
    /**
     * @description List of properties on the row's data object. Each property is used as column header in the matrix view.
     * @type {Array<string>}
     * @public
     */
    get properties() {
        return Array.from(this.private_properties);
    }

    /** 
     * @description List of data for each "row". A row will have a name (used as row header in the matrix view). And data is an object with as many properties.
     * @type {Array<OrgCheckMatrixRowData>}
     * @public
     */
    get rows() {
        return Array.from(this.private_rows.values());
    };

    /**
     * @description Add a value to the property of a specific row given its id (and later on visible given its name)
     * @param {string} rowId 
     * @param {string} rowName 
     * @param {string} property 
     * @param {string} value 
     * @public
     */
    addValueToProperty(rowId, rowName, property, value) {
        if (this.private_rows.has(rowId) === false) {
            this.private_rows.set(rowId, new OrgCheckMatrixRowData(rowName));
        }
        this.private_rows.get(rowName).data[property] = value;
        this.private_properties.add(property);
    }

    /**
     * @type {Set}
     * @private
     */
    private_properties;

    /**
     * @type {Map}
     * @private
     */
    private_rows;

    /**
     * Constructor
     */
    constructor() {
        this.private_properties = new Set();
        this.private_rows = new Map();
    }
}

export class OrgCheckMatrixRowData {
    
    /**
     * @description Constructor
     * @param {string} name 
     */
    constructor(name) {
        this.name = 
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name;
    
        this.data = {};
    }

    /**
     * @description Name of the matrix row
     * @type {string}
     * @public
     */
    
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name;
    

    /** 
     * @description Data of the row as an object with dynamic properties (defined in the parent OrgCheckMatrixData object).
     * @type {any}
     * @public
     * @see OrgCheckMatrixData
     */
    data;
}