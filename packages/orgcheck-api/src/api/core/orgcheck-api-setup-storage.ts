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