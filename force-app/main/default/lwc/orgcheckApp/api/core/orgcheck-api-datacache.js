// @ts-check
/** import { TextEncoder, TextDecoder } from 'util'; **/

/**
 * Cache prefix to use
 * 
 * @type {string} 
 */
const CACHE_PREFIX = 'OrgCheck.';

/**
 * Number of milliseconds in one day
 * 
 * @type {number} 
 */
const NB_MILLISEC_IN_ONE_DAY = 1000*60*60*24;

// HEXADECIMAL and BINARY conversion
// https://www.xaymar.com/articles/2020/12/08/fastest-uint8array-to-hex-string-conversion-in-javascript/

/**
 * Helper for conversion
 * 
 * @type {string[]}
 */
const LUT_HEX_4b = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];

/**
 * Helper for conversion
 * 
 * @type {string[]}  
 */
const LUT_HEX_8b = new Array(0x100);
for (let n = 0; n < 0x100; n++) {
  LUT_HEX_8b[n] = `${LUT_HEX_4b[(n >>> 4) & 0xF]}${LUT_HEX_4b[n & 0xF]}`;
}

/**
 * Binary array to Hexadecimal string
 * 
 * @type {function}
 * @param {Uint8Array} buffer 
 * @return {string}
 */
const fromBufferToHex = (buffer) => {
  let out = '';
  for (let idx = 0, edx = buffer.length; idx < edx; idx++) {
    out += LUT_HEX_8b[buffer[idx]];
  }
  return out;
}

/**
 * Hexadecimal string to Binary array
 * 
 * @type {function}
 * @param {string} hex
 * @return {Uint8Array}
 */
const fromHexToBuffer = (hex) => {
    const arr = [];
    for (let i = 0; i < hex.length; i += 2) {
        arr.push(parseInt(hex.substring(i, i+2), 16));
    }
    return new Uint8Array(arr);
}

/**
 * @type {TextEncoder}
 */
const TEXT_ENCODER = new TextEncoder();

/**
 * @type {TextDecoder}
 */
const TEXT_DECODER = new TextDecoder();
  
export class OrgCheckDataCacheManager {

    /**
     * Function to conpress binary data
     * 
     * @type {function}
     * @private
     */
    private_compress;
    
    /**
     * Function to decompress binary data
     * 
     * @type {function}
     * @private
     */
    private_decompress;

    /**
     * Dataset Manager constructor
     * 
     * @param {any} configuration
     * @public
     */
    constructor(configuration) {
        this.private_compress = configuration.compress;
        this.private_decompress = configuration.decompress;
    }

    /**
     * Is the cache has a specific key?
     * 
     * @param {string} key 
     * @returns {boolean} true if the cache has the key, false if not
     * @public
     */
    has(key) {
        return this.private_getEntryFromCache(this.private_generatePhysicalKey(key)) !== null;
    }

    /**
     * Get the entry form the cache
     * 
     * @param {string} key 
     * @returns {Map | any}
     * @public
     */
    get(key) {
        const entry = this.private_getEntryFromCache(this.private_generatePhysicalKey(key));
        if (!entry) return null;
        if (entry.type === 'map') return new Map(entry.data);
        return entry.data;
    }

    /**
     * Set an entry into the cache with a given key
     * 
     * @param {string} key 
     * @param {Map | any} value
     * @public
     */
    set(key, value) {
        try {
            const physicalKey = this.private_generatePhysicalKey(key);
            if (value === null) {
                localStorage.remove(physicalKey);
            } else if (value instanceof Map) {
                this.private_setItemFromLocalStorage(
                    physicalKey, 
                    JSON.stringify(
                        { 
                            type: 'map', 
                            length: value.size,
                            data: Array.from(value.entries().filter(([k]) => k.endsWith('Ref') === false)),
                            created: Date.now()
                        }
                    )
                );
            } else {
                this.private_setItemFromLocalStorage(
                    physicalKey, 
                    JSON.stringify({ data : value, created: Date.now() })
                );
            }
        } catch(error) {
            console.warn('Not able to store in local store that amount of data.')
        }
    }

    /**
     * Get details of the cache.
     * 
     * @returns {Array<{name: string, isEmpty: boolean, isMap: boolean, length: number, created: number}>} an array of objects that contains the name, the type, the size and the creation date of each entry.
     */
    details() {
        const info = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(CACHE_PREFIX)) {
                const entry = this.private_getEntryFromCache(key);
                info.push({
                    name: this.private_generateLogicalKey(key),
                    isEmpty: entry === null,
                    isMap: entry?.type === 'map',
                    length: entry?.length,
                    created: entry?.created
                });
            }
        }
        return info;
    }

    /**
     * Remove an entry of the cache.
     * 
     * @param {string} key 
     * @public
     */
    remove(key) {
        localStorage.removeItem(this.private_generatePhysicalKey(key));
    }

    /**
     * Remove all entries in the cache.
     * @public
     */
    clear() {
        localStorage.clear();
    }

    /**
     * Generate the physical key from either the logic key or the physical key.
     * Physical key starts with the CACHE_PREFIX and then the key itself.
     * 
     * @param {string} key
     * @returns {string} the physical key
     * @private
     */
    private_generatePhysicalKey = (key) => {
        return key.startsWith(CACHE_PREFIX) ? key : CACHE_PREFIX + key;
    }
    
    /**
     * Generate the logic key from either the logic key or the physical key.
     * Logical key does no start with the CACHE_PREFIX.
     * 
     * @param {string} key
     * @returns {string} the logical key
     * @private
     */
    private_generateLogicalKey = (key) => {
        return key.startsWith(CACHE_PREFIX) ? key.substring(CACHE_PREFIX.length) : key;
    }

    /**
     * Get the item from local storage from its key.
     * The data is stored in hexadecimal format.
     * We turn the hexadecimal value into a binary data
     * Then as that data is compressed, it needs to be decompressed
     * FInally we decode the uncompressed data into a string value
     * 
     * @param {string} key
     * @returns {string} the item from local storage
     * @private
     */
    private_getItemFromLocalStorage = (key) => {
        try {
            const hexValue = localStorage.getItem(key);
            if (hexValue) {
                const bufferValue = fromHexToBuffer(hexValue);
                const uncompressedValue = this.private_decompress(bufferValue);
                const decodedValue = TEXT_DECODER.decode(uncompressedValue);
                return decodedValue;
            }
        } catch (error) {
            console.error(`Error occured when trying to get the value for key ${key}`, error);
        }
        return null;
    }

    /**
     * Set the item to the local storage with its key and string value.
     * The string value is encoded into a binary data.
     * Then we compress this binary data into another binary data (hopefuly shorter)
     * Then that data is turned into a hexadecimal value
     * Finally we store the hexadecimal data in the local storage with its key.
     * 
     * @param {string} key
     * @param {string} stringValue
     * @private
     */
    private_setItemFromLocalStorage = (key, stringValue) => {
        try {
            const encodedValue = TEXT_ENCODER.encode(stringValue);
            const compressedValue = this.private_compress(encodedValue);
            const hexValue = fromBufferToHex(compressedValue);
            localStorage.setItem(key, hexValue);
        } catch (error) {
            console.error(`Error occured when trying to save the value for key ${key}`, error);
        }
    }

    /**
     * Get the entry from the cache.
     * If the entry is older than one day, it is removed from the cache.
     * 
     * @param {string} key
     * @returns {object} the entry from the cache
     * @private
     */
    private_getEntryFromCache = (key) => {
        const entryFromStorage = this.private_getItemFromLocalStorage(key);
        if (!entryFromStorage) return null
        const entry = JSON.parse(entryFromStorage);
        if (Date.now() - entry.created > NB_MILLISEC_IN_ONE_DAY) return null;
        return entry;
    }
}