export interface Row {

    /** @type {number} */
    index: number;

    /** @type {string} */
    name: string;

    /** @type {number} */
    score: number;

    /** @type {Array<string>} */
    badFields: Array<string>;

    /** @type {Array<string>} */
    badReasonIds: Array<string>;

    /** @type {Array<any>} */
    cells: Array<any>;

    /** @type {boolean} */
    isVisible: boolean;
}