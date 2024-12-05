/** import { TextEncoder, TextDecoder } from 'util'; **/

const CACHE_PREFIX = 'OrgCheck.';

const NB_MILLISEC_IN_ONE_DAY = 1000*60*60*24;

// source for HEX conversion: https://www.xaymar.com/articles/2020/12/08/fastest-uint8array-to-hex-string-conversion-in-javascript/

const LUT_HEX_4b = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];

const LUT_HEX_8b = new Array(0x100);
for (let n = 0; n < 0x100; n++) {
  LUT_HEX_8b[n] = `${LUT_HEX_4b[(n >>> 4) & 0xF]}${LUT_HEX_4b[n & 0xF]}`;
}

const fromBufferToHex = (buffer) => {
  let out = '';
  for (let idx = 0, edx = buffer.length; idx < edx; idx++) {
    out += LUT_HEX_8b[buffer[idx]];
  }
  return out;
}

const fromHexToBuffer = (hex) => {
    const arr = [];
    for (let i = 0; i < hex.length; i += 2) {
        arr.push(parseInt(hex.substr(i, 2), 16));
    }
    return new Uint8Array(arr);
}

const TEXT_ENCODER = new TextEncoder();
const TEXT_DECODER = new TextDecoder();
  
export class OrgCheckDataCacheManager {

    #compress;
    #decompress;

    _generatePhysicalKey = (key) => {
        return key.startsWith(CACHE_PREFIX) ? key : CACHE_PREFIX + key;
    }
    
    _generateLogicalKey = (key) => {
        return key.startsWith(CACHE_PREFIX) ? key.substring(CACHE_PREFIX.length) : key;
    }

    _getItemFromLocalStorage = (key) => {
        try {
            const hexValue = localStorage.getItem(key);
            if (hexValue) {
                const bufferValue = fromHexToBuffer(hexValue);
                const uncompressedValue = this.#decompress(bufferValue);
                const decodedValue = TEXT_DECODER.decode(uncompressedValue);
                return decodedValue;
            }
        } catch (error) {
            console.error(`Error occured when trying to get the value for key ${key}`, error);
        }
        return null;
    }
    
    _setItemFromLocalStorage = (key, stringValue) => {
        try {
            const encodedValue = TEXT_ENCODER.encode(stringValue);
            const compressedValue = this.#compress(encodedValue);
            const hexValue = fromBufferToHex(compressedValue);
            localStorage.setItem(key, hexValue);
        } catch (error) {
            console.error(`Error occured when trying to save the value for key ${key}`, error);
        }
    }

    _getEntryFromCache = (key) => {
        const entryFromStorage = this._getItemFromLocalStorage(key);
        if (!entryFromStorage) return null
        const entry = JSON.parse(entryFromStorage);
        if (Date.now() - entry.created > NB_MILLISEC_IN_ONE_DAY) return null;
        return entry;
    }

    /**
     * Dataset Manager constructor
     * 
     * @param configuration
     */
    constructor(configuration) {
        this.#compress = configuration.compress;
        this.#decompress = configuration.decompress;
    }

    has(key) {
        return this._getEntryFromCache(this._generatePhysicalKey(key)) !== null;
    }

    get(key) {
        const entry = this._getEntryFromCache(this._generatePhysicalKey(key));
        if (!entry) return null;
        if (entry.type === 'map') return new Map(entry.data);
        return entry.data;
    }

    set(key, value) {
        try {
            const physicalKey = this._generatePhysicalKey(key);
            if (value === null) {
                localStorage.remove(physicalKey);
            } else if (value instanceof Map) {
                this._setItemFromLocalStorage(
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
                this._setItemFromLocalStorage(
                    physicalKey, 
                    JSON.stringify({ data : value, created: Date.now() })
                );
            }
        } catch(error) {
            console.warn('Not able to store in local store that amount of data.')
        }
    }

    details() {
        const info = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(CACHE_PREFIX)) {
                const entry = this._getEntryFromCache(key);
                info.push({
                    name: this._generateLogicalKey(key),
                    isEmpty: entry === null,
                    isMap: entry?.type === 'map',
                    length: entry?.length,
                    created: entry?.created
                });
            }
        }
        return info;
    }

    remove(key) {
        localStorage.removeItem(this._generatePhysicalKey(key));
    }

    clear() {
        localStorage.clear();
    }
}