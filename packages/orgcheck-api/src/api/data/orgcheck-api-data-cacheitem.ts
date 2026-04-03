import { Data } from 'src/api/core/data/orgcheck-api-data';
import { DataAliases } from 'src/api/core/data/orgcheck-api-data-aliases';

/**
 * @description Cache item interface
 */ 
export interface CacheItem extends Data {

    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.CacheItem;
    
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