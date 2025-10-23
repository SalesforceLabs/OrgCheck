const REGEX_HTMLTAGS = new RegExp("/[<>]/", 'g');
const EMPTY_STRING = '';

export class Sanitizer {

    /**
     * @description Sanitize the given input to prevent XSS attacks.
     * @param {string} input - Input string to sanitize
     * @returns {string} Sanitized string
     * @static
     */
    static sanitize(input) {
        if (input === undefined || input === null) {
            return EMPTY_STRING;
        }
        if (typeof input !== 'string') {
            return EMPTY_STRING;
        }
        return input.replace(REGEX_HTMLTAGS, EMPTY_STRING);
    }
}