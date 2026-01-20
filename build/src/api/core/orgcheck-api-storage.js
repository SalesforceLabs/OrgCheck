/* eslint-disable jsdoc/require-returns-check */ 
export class StorageIntf {

    /**
     * @description Set an Item in the storage
     * @param {string} key - The key to set
     * @param {string} value - The value to set
     */
    setItem(key, value) { throw new Error(`Method setItem(key=${key}, value=${value}) not implemented yet.`); }  

    /**
     * @description Get an Item in the storage
     * @param {string} key - The key to set
     * @returns {string} The stored value for the given key
     */
    getItem(key) { throw new Error(`Method getItem(key=${key}) not implemented yet.`); } 

    /**
     * @description Remove an Item in the storage
     * @param {string} key - The key to remove
     */
    removeItem(key) { throw new Error(`Method removeItem(key=${key}) not implemented yet.`); }  

    /**
     * @description Get all the keys in the storage
     * @returns {Array<string>} List of keys
     */
    keys() { throw new Error(`Method keys() not implemented yet.`); }
}