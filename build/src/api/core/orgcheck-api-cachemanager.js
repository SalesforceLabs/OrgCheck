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
     * @description Get the entry form the cache
     * @param {string} key 
     * @returns {Map | any}
     * @public
     */
    get(key) { throw new Error('Not implemented'); }

    /**
     * @description Set an entry into the cache with a given key
     * @param {string} key 
     * @param {Map | any} value
     * @public
     */
    set(key, value) { throw new Error('Not implemented'); }

    /**
     * @description Get details of the cache.
     * @returns {Array<DataCacheItem>} an array of objects that contains the name, the type, the size and the creation date of each entry.
     */
    details() { throw new Error('Not implemented'); }

    /**
     * @description Remove an entry of the cache.
     * @param {string} key 
     * @public
     */
    remove(key) { throw new Error('Not implemented'); }

    /**
     * @description Remove all entries in the cache.
     * @public
     */
    clear() { throw new Error('Not implemented'); }
}