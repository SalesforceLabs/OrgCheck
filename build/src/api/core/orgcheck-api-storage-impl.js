import { StorageIntf } from "./orgcheck-api-storage";

/**
 * @description Web Storage implementation of the Storage Interface
 *              Note: LWC Security avoid passing localStorage methods directly to a third party library :D
 */
export class Storage extends StorageIntf {

    /**
     * @description The local storage instance
     * @type {{setItem: Function, getItem: Function, removeItem: Function, key: Function, length: number}}
     */
    _storage;
    
    /**
     * @description Constructor
     * @param {{setItem: Function, getItem: Function, removeItem: Function, key: Function, length: number}} localStorage - The local storage instance (from LWC context)
     */
    constructor(localStorage) {
        super();
        this._storage = localStorage;
    }

    /**
     * @description Set an item in the local storage
     * @param {string} key - The key to set
     * @param {string} value - The value to set
     */
    setItem(key, value) { 
        this._storage.setItem(key, value); 
    }

    /**
     * @description Get an item from the local storage
     * @param {string} key - The key to set
     * @returns {string} The stored value for the given key
     */
    getItem(key) { 
        return this._storage.getItem(key); 
    }

    /**
     * @description Removes an item from the local storage
     * @param {string} key - The key to remove
     */
    removeItem(key) { 
        this._storage.removeItem(key);
    }
    
    /**
     * @description Get all the keys in the storage
     * @returns {Array<string>} List of keys
     */
    keys() {  
        const keys = []; 
        for (let i = 0; i < this._storage.length; i++) {
            keys.push(this._storage.key(i)); 
        }
        return keys; 
    }
}