/**
 * @description Cache item class
 */ 
export class DataCacheItem {

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

/**
 * @description Global information stored in cache (both for data and metdata!)
 */ 
export class ItemInCache {

    /** 
     * @type {number}
     */
    created: number;
}

/**
 * @description Data information stored in cache (not the metadata!)
 */ 
export class DataItemInCache extends ItemInCache {

    /** 
     * @type {Array<any>}
     */
    content: any[];
}

/**
 * @description Metadata information stored in cache (not the data!)
 */ 
export class MetadataItemInCache extends ItemInCache {

    /** 
     * @type {string}
     */
    type: string;

    /** 
     * @type {number}
     */
    length: number;
}

/** 
 * @description Cache Manager interface
 */
export interface DataCacheManagerIntf {

    /**
     * @description Get the entry from the cache
     * @param {string} key - the key of the entry to get
     * @returns {any} the value of the entry in the cache
     * @public
     */
    get(key: string): any;

    /**
     * @description Set an entry into the cache with a given key
     * @param {string} key - the key of the entry to set
     * @param {any} value - the value of the entry to set
     * @public
     */
    set(key: string, value: any): void;

    /**
     * @description Get details of the cache.
     * @returns {Array<DataCacheItem> | undefined} an array of objects that contains the name, the type, the size and the creation date of each entry.
     */
    details(): DataCacheItem[]

    /**
     * @description Remove an entry of the cache.
     * @param {string} key - the key of the entry to remove
     * @public
     */
    remove(key: string): void;

    /**
     * @description Remove all entries in the cache.
     * @public
     */
    clear(): void;
}