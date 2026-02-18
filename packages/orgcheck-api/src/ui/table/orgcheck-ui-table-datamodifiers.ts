export interface TextTruncatedModifier {

    /**
     * @description If text value has more than this maximum length of characters, the string will be truncated accordingly.
     * @type {number}
     */
    maximumLength: number;

    /**
     * @description If value is empty (undefined, empty string, numerical zero, empty list, etc...), this is the substitute text to use
     * @type {string}
     */
    valueIfEmpty: string;
}

export interface PreformattedModifier {

    /**
     * @description If text value will be rendered as preformatted (like code or formulas etc.)
     * @type {boolean}
     */
    preformatted: boolean;

    /**
     * @description If text value has more than this maximum length of characters, the string will be truncated accordingly.
     * @type {number}
     */
    maximumLength: number;
}

export interface EmptyModifier {

    /**
     * @description If value is empty (undefined, empty string, numerical zero, empty list, etc...), this is the substitute text to use
     * @type {string}
     */
    valueIfEmpty: string;
}

export interface NumericMinimumModifier {

    /**
     * @description If the value is less that this value, the text will be substituted.
     * @type {number}
     */
    minimum: number;

    /**
     * @description If value is less than 'min', this is the substitute text to use
     * @type {string}
     */
    valueBeforeMin: string;

    /**
     * @description If value is undefined (not zero), this is the substitute text to use
     * @type {string}
     */
    valueIfEmpty: string;
}

export interface NumericMaximumModifier {

    /**
     * @description If the value is greater that this value, the text will be substituted.
     * @type {number}
     */
    maximum: number;

    /**
     * @description If value is greater than 'max', this is the substitute text to use
     * @type {string}
     */
    valueAfterMax: string;
}

export interface NumericMinMaxModifier {

    /**
     * @description If the value is less that this value, the text will be substituted.
     * @type {number}
     */
    minimum: number;

    /**
     * @description If value is less than 'min', this is the substitute text to use
     * @type {string}
     */
    valueBeforeMin: string;

    /**
     * @description If the value is greater that this value, the text will be substituted.
     * @type {number}
     */
    maximum: number;

    /**
     * @description If value is greater than 'max', this is the substitute text to use
     * @type {string}
     */
    valueAfterMax: string;
}
