/**
 * @description Cache item class
 */ 
export class OrgCheckDataCacheItem {

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
 * @description Cache Manager interface
 */
export class OrgCheckDataCacheManagerIntf {

    /**
     * @description Is the cache has a specific key?
     * @param {string} key 
     * @returns {boolean} true if the cache has the key, false if not
     * @public
     */
    has(key) { throw new Error('Not implemented'); }

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
     * @returns {Array<OrgCheckDataCacheItem>} an array of objects that contains the name, the type, the size and the creation date of each entry.
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