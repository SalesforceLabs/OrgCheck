export class Sanitizer {

    /**
     * @description Sanitize the given input to prevent XSS attacks.
     * @param {string} input - Input string to sanitize
     * @returns {string} Sanitized string
     * @static
     */
    static sanitize(input) {
        if (typeof input !== 'string') {
            return '';
        }
        return input.replace(/[<>]/g, '');
    }
}