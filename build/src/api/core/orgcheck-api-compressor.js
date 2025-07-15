export class CompressorIntf {

    /**
     * @description Compress function
     * @type {Function}
     * @param {Uint8Array} data - Input data
     * @returns {Uint8Array} Output data
     */
    compress;

    /**
     * @description Decompress function
     * @type {Function}
     * @param {Uint8Array} data - Input data
     * @returns {Uint8Array} Output data
     */
    decompress;
}

