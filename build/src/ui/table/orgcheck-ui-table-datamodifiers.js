export class TextTruncatedModifier {

    /**
     * @description If text value has more than this maximum length of characters, the string will be truncated accordingly.
     * @type {number}
     */
    maximumLength;

    /**
     * @description If value is empty (undefined, empty string, numerical zero, empty list, etc...), this is the substitute text to use
     * @type {string}
     */
    valueIfEmpty;
}

export class PreformattedModifier {

    /**
     * @description If text value will be rendered as preformatted (like code or formulas etc.)
     * @type {boolean}
     */
    preformatted;

    /**
     * @description If text value has more than this maximum length of characters, the string will be truncated accordingly.
     * @type {number}
     */
    maximumLength;
}

export class EmptyModifier {

    /**
     * @description If value is empty (undefined, empty string, numerical zero, empty list, etc...), this is the substitute text to use
     * @type {string}
     */
    valueIfEmpty;
}

export class NumericMinimumModifier {

    /**
     * @description If the value is less that this value, the text will be substituted.
     * @type {number}
     */
    minimum;

    /**
     * @description If value is less than 'min', this is the substitute text to use
     * @type {string}
     */
    valueBeforeMin;

    /**
     * @description If value is undefined (not zero), this is the substitute text to use
     * @type {string}
     */
    valueIfEmpty;
}

export class NumericMaximumModifier {

    /**
     * @description If the value is greater that this value, the text will be substituted.
     * @type {number}
     */
    maximum;

    /**
     * @description If value is greater than 'max', this is the substitute text to use
     * @type {string}
     */
    valueAfterMax;
}

export class NumericMinMaxModifier {

    /**
     * @description If the value is less that this value, the text will be substituted.
     * @type {number}
     */
    minimum;

    /**
     * @description If value is less than 'min', this is the substitute text to use
     * @type {string}
     */
    valueBeforeMin;

    /**
     * @description If the value is greater that this value, the text will be substituted.
     * @type {number}
     */
    maximum;

    /**
     * @description If value is greater than 'max', this is the substitute text to use
     * @type {string}
     */
    valueAfterMax;
}
