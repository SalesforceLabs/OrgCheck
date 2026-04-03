export interface CompressorIntf {

    /**
     * @description Encode and compress function
     * @param {string} data - Input data
     * @throws {Error} Not implemented yet
     * @returns {string} Output data in hexadecimal format
     */
    compress(data: string): string;

    /**
     * @description Decompress function
     * @param {string} data - Input data in hexadecimal format
     * @throws {Error} Not implemented yet
     * @returns {string} Output data
     */
    decompress(data: string): string;
}