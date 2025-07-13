/**
 * @description Cache item class
 */ 
export class DataCacheItem {

    /** 
     * @type {string}
     */
    name;

    /** 
     * @type {boolean}
     */
    isEmpty;

    /** 
     * @type {boolean}
     */
    isMap;

    /** 
     * @type {number}
     */
    length;

    /** 
     * @type {number}
     */
    created;
}

/**
 * @description Global information stored in cache (both for data and metdata!)
 */ 
export class ItemInCache {

    /** 
     * @type {number}
     */
    created;
}

/**
 * @description Data information stored in cache (not the metadata!)
 */ 
export class DataItemInCache extends ItemInCache {

    /** 
     * @type {Array<any>}
     */
    content;
}

/**
 * @description Metadata information stored in cache (not the data!)
 */ 
export class MetadataItemInCache extends ItemInCache {

    /** 
     * @type {string}
     */
    type;

    /** 
     * @type {number}
     */
    length;
}

/** 
 * @description Cache Manager interface
 */
export class DataCacheManagerIntf {

    /**
     * @description Get the entry from the cache
     * @param {string} key - the key of the entry to get
     * @returns {any} the value of the entry in the cache
     * @public
     */
    get(key) { throw new Error(`Method get(key=${key}) not implemented yet.`); }

    /**
     * @description Set an entry into the cache with a given key
     * @param {string} key - the key of the entry to set
     * @param {any} value - the value of the entry to set
     * @public
     */
    set(key, value) { throw new Error(`Method set(key=${key}, value=${value}) not implemented yet.`); }

    /**
     * @description Get details of the cache.
     * @returns {Array<DataCacheItem> | undefined} an array of objects that contains the name, the type, the size and the creation date of each entry.
     */
    details() { throw new Error(`Method details() not implemented yet.`); }

    /**
     * @description Remove an entry of the cache.
     * @param {string} key - the key of the entry to remove
     * @public
     */
    remove(key) { throw new Error(`Method remove(key=${key}) not implemented yet.`); }

    /**
     * @description Remove all entries in the cache.
     * @public
     */
    clear() { throw new Error(`Method clear() not implemented yet.`); }
}