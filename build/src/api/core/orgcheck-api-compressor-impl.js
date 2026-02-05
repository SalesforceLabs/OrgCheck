import { CompressorIntf } from "./orgcheck-api-compressor";

export class Compressor extends CompressorIntf {

    /**
     * @description The Fflate API instance
     * @type {any}
     * @private
     */
    _api;

    /**
     * @description Constructor
     */
    constructor() {
        super();
        // @ts-ignore
        this._api = window?.fflate ?? globalThis?.fflate ?? null;
        if (!this._api) throw new Error("fflate library not found");
    }

    /**
     * @description Encode and compress function
     * @param {string} data - Input data
     * @throws {Error} Not implemented yet
     * @returns {string} Output data in hexadecimal format
     */
    compress(data) { 
        const encodedValue = this._api?.strToU8(data);
        const compressedValue = this._api?.zlibSync(encodedValue, { level: 9 })
        return FROM_BUFFER_TO_HEX(compressedValue);
    }

    /**
     * @description Decompress function
     * @param {string} data - Input data in hexadecimal format
     * @throws {Error} Not implemented yet
     * @returns {string} Output data
     */
    decompress(data) { 
        const bufferValue = FROM_HEX_TO_BUFFER(data);
        const uncompressedValue = this._api?.unzlibSync(bufferValue);
        const decodedValue = this._api?.strFromU8(uncompressedValue); 
        return decodedValue;
    }
}

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
 * @type {Function}
 * @param {Uint8Array} buffer - the binary array to convert to hexadecimal string
 * @returns {string} the hexadecimal string representation of the binary array
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
 * @type {Function}
 * @param {string} hex - the hexadecimal string to convert to binary array
 * @returns {Uint8Array} the binary array representation of the hexadecimal string
 * @see https://www.xaymar.com/articles/2020/12/08/fastest-uint8array-to-hex-string-conversion-in-javascript/
 */
const FROM_HEX_TO_BUFFER = (hex) => {
    const arr = [];
    for (let i = 0; i < hex.length; i += 2) {
        arr.push(parseInt(hex.substring(i, i+2), 16));
    }
    return new Uint8Array(arr);
}