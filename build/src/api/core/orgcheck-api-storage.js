export class StorageIntf {

    /**
     * @description Set an Item in the storage
     * @type {Function}
     * @param {string} key - The key to set
     * @param {string} value - The value to set
     */
    setItem;

    /**
     * @description Get an Item in the storage
     * @type {Function}
     * @param {string} key - The key to set
     * @returns {string} The stored value for the given key
     */
    getItem;

    /**
     * @description Remove an Item in the storage
     * @type {Function}
     * @param {string} key - The key to remove
     */
    removeItem;

    /**
     * @description Get all the keys in the storage
     * @type {Function}
     * @returns {Array<string>} List of keys
     */
    keys;
}