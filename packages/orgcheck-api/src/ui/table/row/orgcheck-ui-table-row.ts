export interface Row {

    /** 
     * @description Pre-calcultaed index of the row (needs to be recalculated when sroting for example!)
     * @type {number} 
     * @public
     */
    index: number;

    /** 
     * @description Name of the row
     * @type {string} 
     * @public
     */
    name: string;

    /** 
     * @description Score of the row if it has one
     * @type {number} 
     * @public
     */
    score: number;

    /** 
     * @description List of bad fields (must match column's value)
    /* @type {string[]} 
     * @public
     */
    badFields: string[];

    /** 
     * @description List of reason id when this row is bad (can be empty, should not have duplicates)
    /* @type {string[]} 
     * @public
     */
    badReasonIds: string[];

    /** 
     * @description List of cells in this row
    /* @type {any[]}
     * @public
     */
    cells: any[];

    /** 
     * @description Flag used when filtering the table. Meaning is obvious.
    /* @type {boolean} 
     * @public
     */
    isVisible: boolean;
}