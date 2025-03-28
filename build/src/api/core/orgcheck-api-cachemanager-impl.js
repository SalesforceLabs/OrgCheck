import { DataCacheItem, DataCacheManagerIntf, MetadataItemInCache, DataItemInCache } from "./orgcheck-api-cachemanager";

/** 
 * @description Cache Manager class implementation
 */
export class DataCacheManager extends DataCacheManagerIntf {

    /**
     * @description Function to compress binary data
     * @type {function}
     * @private
     */
    _compress;
    
    /**
     * @description Function to decompress binary data
     * @type {function}
     * @private
     */
    _decompress;

    /**
     * @description Function to encore string to binary data
     * @type {function}
     * @private
     */
    _encode;
    
    /**
     * @description Function to decode binary data to string
     * @type {function}
     * @private
     */
    _decode;

    /**
     * @description Function to store an "item" in the storage with a given "key"
     * @type {function}
     * @private
     */
    _storageSetItem;

    /**
     * @description Function to retrieve an "item" in the storage from a given "key"
     * @type {function}
     * @private
     */
    _storageGetItem;

    /**
     * @description Function to remove an "item" in the storage from a given "key"
     * @type {function}
     * @private
     */
    _storageRemoveItem;

    /**
     * @description Function to retrieve the nth key in the storage based on its index
     * @type {function}
     * @private
     */
    _storageKey;

    /**
     * @description Function to retrieve all the keys in the storage
     * @type {function}
     * @private
     */
    _storageKeys;

    /**
     * @description Function to retrieve the number of keys/items stored in the storage
     * @type {function}
     * @private
     */
    _storageLength;

    /**
     * @description Cache Manager constructor
     * @param {any} configuration
     * @public
     */
    constructor(configuration) {
        super();
        this._compress = configuration.compress;
        this._decompress = configuration.decompress;
        this._encode = configuration.encode;
        this._decode = configuration.decode;
        this._storageSetItem = configuration.storage.setItem;
        this._storageGetItem = configuration.storage.getItem;
        this._storageRemoveItem = configuration.storage.removeItem;
        this._storageKey = configuration.storage.key;
        this._storageLength = configuration.storage.length;
        this._storageKeys = configuration.storage.keys;
    }

    /**
     * @description Is the cache has a specific key? (based on the metadata entry to make it faster!)
     * @param {string} key 
     * @returns {boolean} true if the cache has the key, false if not
     * @public
     */
    has(key) {
        const metadataPhysicalKey = GENERATE_PHYSICAL_KEY_METADATA(key);
        const dataPhysicalKey = GENERATE_PHYSICAL_KEY_DATA(key);
        // Get information about this key in the metadata first (it will be faster to deserialize!)
        /** @type {MetadataItemInCache} */
        const metadataEntry = this._getEntryFromCache(metadataPhysicalKey);
        // if we get null it means the data is not in the cache or it is too old
        if (metadataEntry === null) {
            // making sure the metadata and related data are removed from local storage if necessary
            this._storageRemoveItem(metadataPhysicalKey);
            this._storageRemoveItem(dataPhysicalKey);
        } else {
            // making sure the data exists in the localstorage (just the key -- do not spend time deserializing!)
            let dataKeyExists = false;
            for (let i = 0; i < this._storageLength() && dataKeyExists === false; i++) {
                if (this._storageKey(i) === dataPhysicalKey) {
                    dataKeyExists = true;
                }
            }
            if (dataKeyExists === false) {
                // the related data does not exist in the local storage
                // even though the metadata says the contrary...
                // so we are going to align the metadata with the data, by removing the metadata entry and return false
                this._storageRemoveItem(metadataPhysicalKey);
                return false;
            }
        }
        // in this case, the metadata and the data are aligned we can return this statement
        return (metadataEntry !== null);
    }

    /**
     * @description Get the entry form the cache (based on the data entry this time!)
     * @param {string} key 
     * @returns {Map | any}
     * @public
     */
    get(key) {
        const metadataPhysicalKey = GENERATE_PHYSICAL_KEY_METADATA(key);
        const dataPhysicalKey = GENERATE_PHYSICAL_KEY_DATA(key);
        // Get information about this key in the metadata first
        /** @type {MetadataItemInCache} */
        const metadataEntry = this._getEntryFromCache(metadataPhysicalKey);
        if (metadataEntry === null) {
            // making sure the metadata and related data are removed from local storage if necessary
            this._storageRemoveItem(metadataPhysicalKey);
            this._storageRemoveItem(dataPhysicalKey);  
            // return null as the metadata is not in the cache
            return null;          
        }
        // now get the data from the local storage
        /** @type {DataItemInCache} */
        const dataEntry = this._getEntryFromCache(dataPhysicalKey);
        if (dataEntry === null) {
            // here the metadata is in the cache but the data is not -- strange!
            // let's correct this by removing the metadata and return null
            this._storageRemoveItem(metadataPhysicalKey);
            return null;
        }
        // Make sure the metadata is up to date with the data
        metadataEntry.length = dataEntry.content.length;
        // ... and is saved!
        this._setItemToCache(metadataPhysicalKey, JSON.stringify(metadataEntry));
        // if the data is a map
        if (metadataEntry.type === 'map') {
            try {
                // create the map from the data (double array structure)
                return new Map(dataEntry.content);
            } catch (error) {
                // something went wrong when trying to create the map, so destroying everything!
                this._storageRemoveItem(metadataPhysicalKey);
                this._storageRemoveItem(dataPhysicalKey);  
                // return null as the metadata is not in the cache anymore
                return null;
            }
        } else { // if the data is something else
            return dataEntry.content;
        }
    }

    /**
     * @description Set an entry into the cache with a given key
     * @param {string} key 
     * @param {Map | any} value
     * @public
     */
    set(key, value) {
        const metadataPhysicalKey = GENERATE_PHYSICAL_KEY_METADATA(key);
        const dataPhysicalKey = GENERATE_PHYSICAL_KEY_DATA(key);
        if (value === null) {
            this._storageRemoveItem(metadataPhysicalKey);
            this._storageRemoveItem(dataPhysicalKey);
        } else {
            const now = Date.now();
            /** @type {MetadataItemInCache} */
            const metadataEntry = value instanceof Map ? {
                type: 'map', length: value.size, created: now
            } : {
                type: 'array', length: value.length, created: now
            };
            /** @type {DataItemInCache} */
            const dataEntry = value instanceof Map ? {
                content: Array.from(value.entries().filter(([k]) => k.endsWith('Ref') === false)), created: now
            } : {
                content: value, created: now
            };
            try {
                this._setItemToCache(dataPhysicalKey, JSON.stringify(dataEntry)); // this is more likely to throw an error if data exceeds the local storage limit, so do it first!
                this._setItemToCache(metadataPhysicalKey, JSON.stringify(metadataEntry));
            } catch(error) { 
                // Not able to store in local store that amount of data.
                // Making sure to clean both cache entries to be consistent
                this._storageRemoveItem(metadataPhysicalKey);
                this._storageRemoveItem(dataPhysicalKey);
            }
        }
    }

    /**
     * @description Get details of the cache.
     * @returns {Array<DataCacheItem>} an array of objects that contains the name, the type, the size and the creation date of each entry.
     */
    details() {
        return this._storageKeys()
            .filter((key) => key.startsWith(METADATA_CACHE_PREFIX))
            .map((key) => {
                /** @type {MetadataItemInCache} */
                const entry = this._getEntryFromCache(key);
                const name = GENERATE_LOGICAL_KEY(key);
                if (entry) {
                    return { name: name, isEmpty: entry.length === 0, isMap: entry.type === 'map', length: entry.length, created: entry.created };    
                }
                return { name: name, isEmpty: true, isMap: false, length: 0, created: 0 };
            }
        );
    }

    /**
     * @description Remove an entry of the cache.
     * @param {string} key 
     * @public
     */
    remove(key) {
        this._storageRemoveItem(GENERATE_PHYSICAL_KEY_DATA(key));
        this._storageRemoveItem(GENERATE_PHYSICAL_KEY_METADATA(key));
    }

    /**
     * @description Remove all Org-Check-related entries from the cache.
     * @public
     */
    clear() {
        return this._storageKeys()
            .filter((key) => key.startsWith(CACHE_PREFIX))
            .forEach((key) => this._storageRemoveItem(key));
    }

    /**
     * @description Set the item to the local storage with its key and string value. The string value is 
     *   encoded into a binary data. Then we compress this binary data into another binary data (hopefuly 
     *   shorter). Then that data is turned into a hexadecimal value. Finally we store the hexadecimal 
     *   data in the local storage with its key.
     * @param {string} key
     * @param {string} stringValue
     * @throws {Error} Most likely when trying to save the value in the local storage (_storageSetItem)
     * @private
     */
    _setItemToCache = (key, stringValue) => {
        let encodedValue, compressedValue, hexValue;
        try {
            encodedValue = this._encode(stringValue);
            compressedValue = this._compress(encodedValue);
            hexValue = FROM_BUFFER_TO_HEX(compressedValue);
            this._storageSetItem(key, hexValue);
        } catch (error) {
            throw new Error(
                `Error occured when trying to save the value for key ${key} with: `+
                    `hexValue.length=${hexValue?.length || 'N/A'}, `+
                    `compressedValue.length=${compressedValue?.length || 'N/A'}, `+
                    `encodedValue.length=${encodedValue?.length || 'N/A'}. `+
                    `Initiale error message was ${error.message}`
            );
        }
    }

    /**
     * @description Get the entry from the cache. If the entry is older than one day, it is removed from the cache.
     * @param {string} key
     * @returns {any} the entry from the cache
     * @private
     */
    _getEntryFromCache = (key) => {
        let entryFromStorage = null;
        try {
            const hexValue = this._storageGetItem(key);
            if (hexValue) {
                const bufferValue = FROM_HEX_TO_BUFFER(hexValue);
                const uncompressedValue = this._decompress(bufferValue);
                const decodedValue = this._decode(uncompressedValue);
                entryFromStorage = decodedValue;
            }
        } catch (error) {
            console.error(`Error occured when trying to get the value for key ${key}`, error);
        }
        if (!entryFromStorage) return null;
        try {
            const entry = JSON.parse(entryFromStorage);
            if (entry.created && Date.now() - entry.created > NB_MILLISEC_IN_ONE_DAY) return null;
            return entry;
        } catch (error) {
            console.error(`Error occured when trying to parse the string: ${entryFromStorage}`, error);
            return null;
        }
    }
}

/**
 * @description Cache prefix to use for any items stored in the local storage for Org Check
 * @type {string} 
 */
const CACHE_PREFIX = 'OrgCheck';

/**
 * @description Cache prefix to use for data stored in the local storage
 * @type {string} 
 */
const DATA_CACHE_PREFIX = `${CACHE_PREFIX}.`;

/**
 * @description Cache prefix to use for metadata stored in the local storage
 * @type {string} 
 */
const METADATA_CACHE_PREFIX = `${CACHE_PREFIX}_`;

/**
 * @description Generate the data physical key from either the logic key or the physical key. 
 *                  Data physical key starts with the DATA_CACHE_PREFIX and then the key itself.
 * @param {string} key
 * @returns {string} the data physical key
 * @private
 */
const GENERATE_PHYSICAL_KEY_DATA = (key) => {
    return key.startsWith(DATA_CACHE_PREFIX) ? key : DATA_CACHE_PREFIX + key;
}

/**
 * @description Generate the metadata physical key from either the logic key or the physical key. 
 *                  Metadata physical key starts with the METADATA_CACHE_PREFIX and then the key itself.
 * @param {string} key
 * @returns {string} the metadata physical key
 * @private
 */
const GENERATE_PHYSICAL_KEY_METADATA = (key) => {
    return key.startsWith(METADATA_CACHE_PREFIX) ? key : METADATA_CACHE_PREFIX + key;
}

/**
 * @description Generate the logical key from either the logic key or the physical key. 
 * @param {string} key
 * @returns {string} the logical key
 * @private
 */
const GENERATE_LOGICAL_KEY = (key) => {
    if (key.startsWith(METADATA_CACHE_PREFIX)) return key.substring(METADATA_CACHE_PREFIX.length);
    if (key.startsWith(DATA_CACHE_PREFIX)) return key.substring(DATA_CACHE_PREFIX.length);
    return key;
}

/**
 * @description Number of milliseconds in one day
 * @type {number} 
 */
const NB_MILLISEC_IN_ONE_DAY = 1000*60*60*24;

/**
 * @description Helper for conversion
 * @type {string[]}
 * @see https://www.xaymar.com/articles/2020/12/08/fastest-uint8array-to-hex-string-conversion-in-javascript/
 */
const LUT_HEX_4b = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];

/**
 * @description Helper for conversion
 * @type {string[]}  
 * @see https://www.xaymar.com/articles/2020/12/08/fastest-uint8array-to-hex-string-conversion-in-javascript/
 */
const LUT_HEX_8b = new Array(0x100);
for (let n = 0; n < 0x100; n++) {
  LUT_HEX_8b[n] = `${LUT_HEX_4b[(n >>> 4) & 0xF]}${LUT_HEX_4b[n & 0xF]}`;
}

/**
 * @description Binary array to Hexadecimal string
 * @type {function}
 * @param {Uint8Array} buffer 
 * @returns {string}
 * @see https://www.xaymar.com/articles/2020/12/08/fastest-uint8array-to-hex-string-conversion-in-javascript/
 */
const FROM_BUFFER_TO_HEX = (buffer) => {
  let out = '';
  for (let idx = 0, edx = buffer.length; idx < edx; idx++) {
    out += LUT_HEX_8b[buffer[idx]];
  }
  return out;
}

/**
 * @description Hexadecimal string to Binary array
 * @type {function}
 * @param {string} hex
 * @returns {Uint8Array}
 * @see https://www.xaymar.com/articles/2020/12/08/fastest-uint8array-to-hex-string-conversion-in-javascript/
 */
const FROM_HEX_TO_BUFFER = (hex) => {
    const arr = [];
    for (let i = 0; i < hex.length; i += 2) {
        arr.push(parseInt(hex.substring(i, i+2), 16));
    }
    return new Uint8Array(arr);
}