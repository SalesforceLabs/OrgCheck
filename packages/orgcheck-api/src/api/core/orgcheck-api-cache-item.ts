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
     * @type {boolean}
     */
    isArray: boolean;

    /** 
     * @type {boolean}
     */
    isObject: boolean;

    /** 
     * @type {number}
     */
    length: number;

    /** 
     * @type {string}
     */
    created: string;
}