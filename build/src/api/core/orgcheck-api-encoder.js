export class EncoderIntf {

    /**
     * @description Encode function
     * @type {Function}
     * @param {string} data - Input data
     * @returns {Uint8Array} Output data
     */
    encode;

    /**
     * @description Decode function
     * @type {Function}
     * @param {Uint8Array} data - Input data
     * @returns {string} Output data
     */
    decode;
}