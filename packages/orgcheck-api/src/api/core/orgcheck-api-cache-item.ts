/**
 * @description Cache item interface
 */ 
export interface DataCacheItemIntf {

    /** 
     * @type {string}
     */
    name: string;

    /** 
     * @type {boolean}
     */
    isEmpty: boolean;

    /** 
     * @type {boolean}
     */
    isMap: boolean;

    /** 
     * @type {number}
     */
    length: number;

    /** 
     * @type {number}
     */
    created: number;
}