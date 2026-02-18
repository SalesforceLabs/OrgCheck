import { StorageIntf } from "./orgcheck-api-storage";

export interface StorageSetup {
    /**
     * @description Set an item in a storage
     * @param {string} key - The key to set
     * @param {string} value - The value to set
     */
    setItem(key: string, value: string): void;

    /**
     * @description Get an item from a storage
     * @param {string} key - The key to set
     * @returns {string} The stored value for the given key
     */
    getItem(key: string): string;

    /**
     * @description Removes an item from a storage
     * @param {string} key - The key to remove
     */
    removeItem(key: string): void;
    
    /**
     * @description Get the nth key from a storage
     * @param {number} n - The index of the key
     * @returns {string} The nth key
     */
    key(n: number): string;
    
    /**
     * @description The size of a storage
     * @property
     */
    length: number;
}

/**
 * @description Web Storage implementation of the Storage Interface
 *              Note: LWC Security avoid passing localStorage methods directly to a third party library :D
 */
export class Storage implements StorageIntf {

    /**
     * @description The local storage instance
     * @type {StorageSetup}
     */
    _storage: StorageSetup;
    
    /**
     * @description Constructor
     * @param {StorageSetup} localStorage - The local storage instance (from LWC context)
     */
    constructor(localStorage: StorageSetup) {
        this._storage = localStorage;
    }

    /**
     * @description Set an item in the local storage
     * @param {string} key - The key to set
     * @param {string} value - The value to set
     */
    setItem(key: string, value: string) { 
        this._storage.setItem(key, value); 
    }

    /**
     * @description Get an item from the local storage
     * @param {string} key - The key to set
     * @returns {string} The stored value for the given key
     */
    getItem(key: string): string { 
        return this._storage.getItem(key); 
    }

    /**
     * @description Removes an item from the local storage
     * @param {string} key - The key to remove
     */
    removeItem(key: string) { 
        this._storage.removeItem(key);
    }
    
    /**
     * @description Get all the keys in the storage
     * @returns {Array<string>} List of keys
     */
    keys(): Array<string> {  
        const keys: string[] = []; 
        for (let i = 0; i < this._storage?.length; i++) {
            const key = this._storage.key(i);
            if (key) {
                keys.push(key); 
            }
        }
        return keys; 
    }
}