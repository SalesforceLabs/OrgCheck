/* eslint-disable jsdoc/require-returns-check */ 
export class CompressorIntf {

    /**
     * @description Encode and compress function
     * @param {string} data - Input data
     * @throws {Error} Not implemented yet
     * @returns {string} Output data in hexadecimal format
     */
    compress(data) { throw new Error(`Method compress(data=${data}) not implemented yet.`); }

    /**
     * @description Decompress function
     * @param {string} data - Input data in hexadecimal format
     * @throws {Error} Not implemented yet
     * @returns {string} Output data
     */
    decompress(data) { throw new Error(`Method decompress(data=${data}) not implemented yet.`); }
}