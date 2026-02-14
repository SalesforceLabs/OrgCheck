export interface StorageIntf {

    /**
     * @description Set an Item in the storage
     * @param {string} key - The key to set
     * @param {string} value - The value to set
     */
    setItem(key: string, value: string): void;

    /**
     * @description Get an Item in the storage
     * @param {string} key - The key to set
     * @returns {string} The stored value for the given key
     */
    getItem(key: string): string;

    /**
     * @description Remove an Item in the storage
     * @param {string} key - The key to remove
     */
    removeItem(key: string): void,

    /**
     * @description Get all the keys in the storage
     * @returns {Array<string>} List of keys
     */
    keys(): string[];
}