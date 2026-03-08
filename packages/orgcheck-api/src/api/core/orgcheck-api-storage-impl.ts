import { StorageIntf } from 'src/api/core/orgcheck-api-storage';
import { StorageSetup } from 'src/api/core/orgcheck-api-setup-storage';

/**
 * @description Web Storage implementation of the Storage Interface
 *              Note: LWC Security avoid passing localStorage methods directly to a third party library :D
 */
export class Storage implements StorageIntf {

    /**
     * @description The local storage instance
     * @type {StorageSetup}
     * @private
     */
    private _storage: StorageSetup;
    
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
     * @public
     */
    public setItem(key: string, value: string) { 
        this._storage.setItem(key, value); 
    }

    /**
     * @description Get an item from the local storage
     * @param {string} key - The key to set
     * @returns {string} The stored value for the given key
     */
    public getItem(key: string): string { 
        return this._storage.getItem(key); 
    }

    /**
     * @description Removes an item from the local storage
     * @param {string} key - The key to remove
     */
    public removeItem(key: string) { 
        this._storage.removeItem(key);
    }
    
    /**
     * @description Get all the keys in the storage
     * @returns {Array<string>} List of keys
     */
    public keys(): Array<string> {  
        const keys: string[] = []; 
        for (let i = 0; i < this._storage?.length(); i++) {
            const key = this._storage.key(i);
            if (key) {
                keys.push(key); 
            }
        }
        return keys; 
    }
}